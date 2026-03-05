import type { FieldHook, GlobalSlug, RowField } from 'payload'
import { slugField as payloadSlugField } from 'payload'

type SlugFieldArgs = NonNullable<Parameters<typeof payloadSlugField>[0]>
type CustomSlugify = SlugFieldArgs['slugify']

// Mirrors payload's internal slugify: spaces → dashes, strip non-word chars, lowercase.
const defaultSlugify = (value: string | undefined | null): string | undefined =>
  value
    ?.replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

// `drafts` is typed as `false | SanitizedDrafts` — `false` means drafts are disabled, so
// `?.autosave` would be a TS error. Narrowing away `false` first resolves it.
const isDraftAutosaveEnabled = (drafts: false | { autosave?: unknown } | null | undefined) =>
  !!(drafts && drafts.autosave)

/**
 * Payload's built-in `generateSlug` beforeChange hook has a race condition when autosave is
 * enabled: with a 100ms autosave interval the second autosave fires before the client receives
 * the first server response. The client still has `data.slug = null` while `originalDoc.slug`
 * already holds the value set by the first save (e.g. "h" from typing "H"). This makes
 * `userOverride = null !== "h" = true`, so the hook skips regeneration and the slug stays as a
 * single letter or null forever.
 *
 * Fix: a null/empty incoming slug is never a real user override — an override requires an
 * explicit non-empty value that differs from the persisted slug.
 *
 * @see https://github.com/payloadcms/payload/issues/15430
 */
function generateSlug({
  slugFieldName,
  slugify: customSlugify,
  useAsSlug,
}: {
  slugFieldName: string
  slugify?: CustomSlugify
  useAsSlug: string
}): FieldHook {
  const doSlugify = async (
    value: string | undefined,
    data: Parameters<FieldHook>[0]['data'],
    req: Parameters<FieldHook>[0]['req'],
  ) =>
    customSlugify
      ? await customSlugify({ data, req, valueToSlugify: value })
      : defaultSlugify(value)

  return async ({ collection, data, global, operation, originalDoc, req, value: isChecked }) => {
    if (operation === 'create') {
      if (data) {
        const source = (data[slugFieldName] as string) || (data[useAsSlug] as string) || undefined
        data[slugFieldName] = await doSlugify(source, data, req)
      }
      return !data?.[slugFieldName] // true = slug still empty, keep auto-generating
    }

    if (operation === 'update') {
      if (!isChecked) return false // user disabled auto-generate checkbox

      const hasAutosave =
        isDraftAutosaveEnabled(collection?.versions?.drafts) ||
        isDraftAutosaveEnabled(global?.versions?.drafts)

      if (!hasAutosave) {
        if (data) data[slugFieldName] = await doSlugify(data[useAsSlug] as string, data, req)
        return !data?.[slugFieldName]
      }

      // --- autosave path ---

      const isPublishing = (data as Record<string, unknown>)?._status === 'published'

      // A real user override is an explicit non-empty slug that differs from what's persisted.
      // null/empty means the client form hasn't received the server's first autosave response yet
      // so treat it as "no override" so the slug keeps tracking the title.
      const slugInData = (data?.[slugFieldName] ?? null) as string | null
      const slugInOriginal = (originalDoc?.[slugFieldName] ?? null) as string | null
      const isUserOverride = Boolean(slugInData) && slugInData !== slugInOriginal

      if (!isUserOverride && data) {
        data[slugFieldName] = data[useAsSlug]
          ? await doSlugify(data[useAsSlug] as string, data, req)
          : null
      }

      // Slug is now stable — stop auto-generating once published or user has taken ownership
      if (isPublishing || isUserOverride) return false

      // Keep the checkbox locked until the doc has had 2+ autosaves, giving the title time to
      // stabilize before the slug is considered final
      const where = { parent: { equals: originalDoc?.id } }
      let versionCount = 0
      if (collection?.slug) {
        const res = await req.payload
          .countVersions({ collection: collection.slug, depth: 0, where })
          .catch(() => ({ totalDocs: 0 }))
        versionCount = res.totalDocs || 0
      } else if ((global as { slug?: string } | null)?.slug) {
        const res = await req.payload
          .countGlobalVersions({
            global: (global as { slug: string }).slug as GlobalSlug,
            depth: 0,
          })
          .catch(() => ({ totalDocs: 0 }))
        versionCount = res.totalDocs || 0
      }

      return versionCount <= 2
    }
  }
}

/**
 * Drop-in replacement for payload's `slugField` that patches the `beforeChange` hook on the
 * internal `generateSlug` checkbox to fix the autosave race condition.
 */
export const slugField = (args?: SlugFieldArgs): RowField => {
  const slugFieldName = args?.name ?? 'slug'
  const checkboxName = args?.checkboxName ?? 'generateSlug'
  const useAsSlug = args?.fieldToUse ?? args?.useAsSlug ?? 'title'

  return payloadSlugField({
    ...args,
    overrides: (baseField) => {
      const checkboxField = baseField.fields.find(
        (f): f is typeof f & { hooks: { beforeChange: FieldHook[] } } =>
          'name' in f && (f as Record<string, unknown>).name === checkboxName,
      )
      if (checkboxField?.hooks?.beforeChange) {
        checkboxField.hooks.beforeChange = [
          generateSlug({ slugFieldName, slugify: args?.slugify, useAsSlug }),
        ]
      }

      return typeof args?.overrides === 'function' ? args.overrides(baseField) : baseField
    },
  })
}
