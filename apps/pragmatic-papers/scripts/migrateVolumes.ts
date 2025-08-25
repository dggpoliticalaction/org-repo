/* eslint-disable no-console */

import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import type { Payload } from 'payload'
import { getPayload } from 'payload'

// Determine __dirname (ES Module compatible)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
console.log(__dirname)

// Adjust the config path relative to this script's location
const payloadConfigPath = path.join(__dirname, '../src/payload.config.ts')
console.log(payloadConfigPath)

import type {
  Volume,
  VolumesSelect,
  VolumeIntroduction,
  EditorsNote,
  ArticleCardsGrid,
  SquiggleRuleBlock,
  Article,
} from '../src/payload-types'

// Useful narrowed runtime shapes derived from generated types
// Note: Payload IDs are numeric per generated types

type VolumeDoc = Pick<Volume, 'id' | 'introduction' | 'editorsNote' | 'articles' | 'layout'>

type RichText = NonNullable<NonNullable<Volume['introduction']>>

type VolumeLayoutBlock = VolumeIntroduction | EditorsNote | ArticleCardsGrid | SquiggleRuleBlock

interface FindResult<T> {
  docs: T[]
}

function argHas(flag: string) {
  return process.argv.includes(flag)
}
function getArg(arg: string, def?: string) {
  const idx = process.argv.indexOf(arg)
  if (idx !== -1 && idx + 1 < process.argv.length) return process.argv[idx + 1]
  return def
}

function normalizeBlocks(arr: Volume['layout']['content'] | undefined | null): VolumeLayoutBlock[] {
  if (Array.isArray(arr)) return arr
  return []
}

function isSquiggleRule(b: unknown): b is SquiggleRuleBlock {
  return (
    typeof b === 'object' && b !== null && (b as SquiggleRuleBlock).blockType === 'squiggleRule'
  )
}

function makeSquiggle(): SquiggleRuleBlock {
  return { blockType: 'squiggleRule', variant: 'animated' }
}

function jsonEq(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

function hasSameIntroBlock(blocks: VolumeLayoutBlock[], introduction: RichText): boolean {
  return blocks.some((b) => b.blockType === 'volumeIntroduction' && jsonEq(b.content, introduction))
}

function hasSameEditorsNoteBlock(blocks: VolumeLayoutBlock[], editorsNote: RichText): boolean {
  return blocks.some((b) => b.blockType === 'editorsNote' && jsonEq(b.content, editorsNote))
}

function idsFromArticles(rel: VolumeDoc['articles']): number[] {
  if (!Array.isArray(rel)) return []
  return rel
    .map((a) =>
      typeof a === 'number' ? a : a && typeof a === 'object' ? (a as Article).id : undefined,
    )
    .filter((x): x is number => typeof x === 'number')
}

function normalizeArticlesField(articles: ArticleCardsGrid['articles']): number[] | undefined {
  if (!Array.isArray(articles)) return undefined
  const ids = articles
    .map((a) =>
      typeof a === 'number' ? a : a && typeof a === 'object' ? (a as Article).id : undefined,
    )
    .filter((x): x is number => typeof x === 'number')
  return ids
}

function hasSameArticleGrid(blocks: VolumeLayoutBlock[], legacyIDs: number[]): boolean {
  return blocks.some((b) => {
    if (b.blockType !== 'articleCardsGrid') return false
    const blkIDs = normalizeArticlesField(b.articles ?? null) ?? []
    return jsonEq(blkIDs, legacyIDs)
  })
}

async function migrateVolumes(pl: Payload, opts: { write: boolean; limit?: number }) {
  const pageSize = 100
  let page = 1

  const stats = {
    scanned: 0,
    updated: 0,
    introBlocksAdded: 0,
    editorsNoteBlocksAdded: 0,
    gridBlocksAdded: 0,
    skippedNoLegacy: 0,
    errors: 0,
  }

  console.log(`Starting volumes migration (write=${opts.write}) ...`)

  while (true) {
    const res = (await pl.find({
      collection: 'volumes',
      limit: Math.min(pageSize, opts.limit ?? pageSize),
      page,
      depth: 0,
      select: {
        id: true,
        introduction: true,
        editorsNote: true,
        articles: true,
        layout: true,
      } as VolumesSelect,
    })) as unknown as FindResult<VolumeDoc>

    if (!res.docs?.length) break

    for (const v of res.docs) {
      stats.scanned++
      try {
        const existing = normalizeBlocks(v.layout?.content ?? null)
        const toPrepend: VolumeLayoutBlock[] = []

        // 1) VolumeIntroduction
        const hasIntroLegacy =
          v.introduction && (!Array.isArray(v.introduction) || v.introduction.length > 0)
        if (hasIntroLegacy && !hasSameIntroBlock(existing, v.introduction as RichText)) {
          const introBlock: VolumeIntroduction = {
            blockType: 'volumeIntroduction',
            content: v.introduction,
          }
          toPrepend.push(introBlock)
          // Insert a squiggle immediately after intro (avoid dup if next is squiggle)
          const nextIsSquiggle = existing[0] && isSquiggleRule(existing[0])
          if (!nextIsSquiggle) {
            toPrepend.push(makeSquiggle())
          }
          stats.introBlocksAdded++
        }

        // 2) ArticleCardsGrid only if there are explicit legacy IDs
        const legacyIDs = idsFromArticles(v.articles)
        if (legacyIDs.length > 0 && !hasSameArticleGrid(existing, legacyIDs)) {
          const grid: ArticleCardsGrid = { blockType: 'articleCardsGrid', articles: legacyIDs }
          toPrepend.push(grid)
          stats.gridBlocksAdded++
        }

        // 3) EditorsNote
        const hasEditorsLegacy =
          v.editorsNote && (!Array.isArray(v.editorsNote) || v.editorsNote.length > 0)
        if (hasEditorsLegacy && !hasSameEditorsNoteBlock(existing, v.editorsNote as RichText)) {
          // Ensure there is a squiggle just before the editors note
          const lastPrepend = toPrepend[toPrepend.length - 1]
          if (!lastPrepend || !isSquiggleRule(lastPrepend)) {
            toPrepend.push(makeSquiggle())
          }
          const editorsNoteBlock: EditorsNote = { blockType: 'editorsNote', content: v.editorsNote }
          toPrepend.push(editorsNoteBlock)
          stats.editorsNoteBlocksAdded++
        }

        if (toPrepend.length === 0) {
          stats.skippedNoLegacy++
          continue
        }

        const newBlocks = [...toPrepend, ...existing]
        // De-duplicate adjacent squiggles at the seam between prepended and existing
        if (newBlocks.length >= 2) {
          const first = newBlocks[0]
          const second = newBlocks[1]
          if (isSquiggleRule(first) && isSquiggleRule(second)) {
            newBlocks.splice(1, 1)
          }
        }

        if (opts.write) {
          await pl.update({
            collection: 'volumes',
            id: v.id,
            data: { layout: { content: newBlocks } },
            depth: 0,
          })
        }

        stats.updated++
      } catch (e) {
        stats.errors++
        console.error(`Error migrating volume ${v?.id}:`, e)
      }
    }

    if (res.docs.length < pageSize) break
    page++
  }

  console.log('--- Migration summary (Volumes) ---')
  console.log(`Scanned:        ${stats.scanned}`)
  console.log(`Updated:        ${stats.updated}`)
  console.log(`Intro added:    ${stats.introBlocksAdded}`)
  console.log(`Grid added:     ${stats.gridBlocksAdded}`)
  console.log(`Editors added:  ${stats.editorsNoteBlocksAdded}`)
  console.log(`Skipped none:   ${stats.skippedNoLegacy}`)
  console.log(`Errors:         ${stats.errors}`)
}

async function main() {
  // Dynamically import your Payload config
  const awaitedConfig = (await import(payloadConfigPath)).default
  const payload = await getPayload({ config: awaitedConfig })

  const write = argHas('--write')
  const limitStr = getArg('--limit')
  const limit = limitStr ? Number(limitStr) : undefined
  if (limitStr && Number.isNaN(limit)) throw new Error('Invalid --limit')

  // getPayload already returns an initialized instance; no extra init required
  await migrateVolumes(payload, { write, limit })

  process.exit(0)
}

main()
