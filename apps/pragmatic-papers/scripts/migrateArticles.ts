/* eslint-disable no-console */

import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

// Determine __dirname (ES Module compatible)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Adjust the config path relative to this script's location
const payloadConfigPath = path.join(__dirname, '../src/payload.config.ts')

import type { Article, ArticleBodyContent } from '../src/payload-types'
import type { Payload } from 'payload'

// Narrowed doc shape
// Note: IDs are numeric in generated types

type ArticleDoc = Pick<Article, 'id' | 'content' | 'layout'>

type RichText = Article['content']

type ArticleLayoutBlock = ArticleBodyContent

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

function normalizeBlocks(arr: unknown): ArticleLayoutBlock[] {
  if (Array.isArray(arr)) return arr as ArticleLayoutBlock[]
  return []
}

function jsonEq(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

// For articles, we model after the volumes migration style: if legacy content exists and
// no equivalent block is present in layout.content, create it. No separators or extras.
function hasSameArticleContentBlock(blocks: ArticleLayoutBlock[], content: RichText): boolean {
  return blocks.some((b) => b.blockType === 'articleBodyContent' && jsonEq(b.content, content))
}

async function migrateArticles(pl: Payload, opts: { write: boolean; limit?: number }) {
  const pageSize = 100
  let page = 1

  const stats = {
    scanned: 0,
    updated: 0,
    contentBlocksAdded: 0,
    skippedNoLegacy: 0,
    errors: 0,
  }

  console.log(`Starting articles migration (write=${opts.write}) ...`)

  while (true) {
    const res = (await pl.find({
      collection: 'articles',
      limit: Math.min(pageSize, opts.limit ?? pageSize),
      page,
      depth: 0,
      // @ts-expect-error - Payload select types are complex and this is a migration script
      select: { id: true, content: true, layout: true },
    })) as unknown as FindResult<ArticleDoc>

    if (!res.docs?.length) break

    for (const a of res.docs) {
      stats.scanned++
      try {
        const existing = normalizeBlocks(a.layout?.content)
        const toPrepend: ArticleLayoutBlock[] = []

        const hasLegacyContent = a.content && (!Array.isArray(a.content) || a.content.length > 0)
        if (hasLegacyContent && !hasSameArticleContentBlock(existing, a.content as RichText)) {
          const contentBlock: ArticleBodyContent = {
            blockType: 'articleBodyContent',
            content: a.content,
          }
          toPrepend.push(contentBlock)
          stats.contentBlocksAdded++
        }

        if (toPrepend.length === 0) {
          stats.skippedNoLegacy++
          continue
        }

        const newBlocks = [...toPrepend, ...existing]

        if (opts.write) {
          await pl.update({
            collection: 'articles',
            id: a.id,
            data: { layout: { content: newBlocks } },
            depth: 0,
          })
        }

        stats.updated++
      } catch (e) {
        stats.errors++
        console.error(`Error migrating article ${a?.id}:`, e)
      }
    }

    if (res.docs.length < pageSize) break
    page++
  }

  console.log('--- Migration summary (Articles) ---')
  console.log(`Scanned:        ${stats.scanned}`)
  console.log(`Updated:        ${stats.updated}`)
  console.log(`Content added:  ${stats.contentBlocksAdded}`)
  console.log(`Skipped none:   ${stats.skippedNoLegacy}`)
  console.log(`Errors:         ${stats.errors}`)
}

async function main() {
  const awaitedConfig = (await import(payloadConfigPath)).default
  const payload = await getPayload({ config: awaitedConfig })

  const write = argHas('--write')
  const limitStr = getArg('--limit')
  const limit = limitStr ? Number(limitStr) : undefined
  if (limitStr && Number.isNaN(limit)) throw new Error('Invalid --limit')

  await migrateArticles(payload, { write, limit })

  process.exit(0)
}

main()
