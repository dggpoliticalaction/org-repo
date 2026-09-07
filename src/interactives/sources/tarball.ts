/**
 * Reading a feed out of a release asset.
 *
 * A publisher that cuts a release can attach the exact bytes a consumer needs. Upstream's
 * `data-json.tar.gz` is one such asset: every runtime JSON file, at the `data/`-prefixed
 * paths the manifest names, and nothing else — no photos, no geometry, no widget. One request
 * replaces a file-by-file walk of the same tag, and the archive cannot be caught half-written
 * the way a directory listing can.
 *
 * The archive is served as a `FileSource`, so nothing downstream knows the difference between
 * a tarball, a checkout on disk and a repo at a ref.
 */

import { type FileSource, withJson } from "./files"

const BLOCK = 512
const decoder = new TextDecoder()

function readString(bytes: Uint8Array, offset: number, length: number): string {
  const field = bytes.subarray(offset, offset + length)
  const end = field.indexOf(0)
  return decoder.decode(end === -1 ? field : field.subarray(0, end))
}

function readOctal(bytes: Uint8Array, offset: number, length: number): number {
  const text = readString(bytes, offset, length).trim()
  const value = text ? Number.parseInt(text, 8) : 0
  return Number.isFinite(value) && value >= 0 ? value : 0
}

/**
 * Every regular file in a tar archive, by path.
 *
 * Only what a `tar czf` of a few directories produces is honoured: regular files, ustar's
 * split `prefix`/`name` for a long path, and GNU's `L` entry for a longer one. Directories,
 * links and PAX metadata records are skipped rather than reported — a consumer asks for the
 * paths it already knows from the manifest, and anything else in the archive is not its
 * business.
 */
export function readTar(bytes: Uint8Array): Map<string, Uint8Array> {
  const files = new Map<string, Uint8Array>()
  let offset = 0
  let longName: string | null = null
  while (offset + BLOCK <= bytes.length) {
    const name = readString(bytes, offset, 100)
    // Two zero-filled blocks end an archive; one is enough to stop reading.
    if (name === "" && readOctal(bytes, offset + 124, 12) === 0) break
    const size = readOctal(bytes, offset + 124, 12)
    const type = String.fromCharCode(bytes[offset + 156] ?? 0)
    const prefix = readString(bytes, offset + 345, 155)
    const data = bytes.subarray(offset + BLOCK, offset + BLOCK + size)
    offset += BLOCK + Math.ceil(size / BLOCK) * BLOCK
    if (type === "L") {
      longName = decoder.decode(data).replace(/\0+$/, "")
      continue
    }
    const path = longName ?? (prefix ? `${prefix}/${name}` : name)
    longName = null
    if (type === "0" || type === "\0") files.set(path, data)
  }
  return files
}

/**
 * gzip, through Node's own inflater — no dependency. Loaded lazily, the way `localFileSource`
 * loads `node:fs`, so importing this module stays harmless wherever it is only referenced.
 */
export async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const { gunzipSync } = await import("node:zlib")
  return new Uint8Array(gunzipSync(bytes))
}

/** A `FileSource` over an archive already in memory. */
export function tarFileSource(label: string, entries: Map<string, Uint8Array>): FileSource {
  const describe = (): string => label
  return withJson({
    describe,
    async read(path) {
      const bytes = entries.get(path)
      if (!bytes) {
        throw new Error(`${describe()} ${path}: not in the archive (${entries.size} files)`)
      }
      return decoder.decode(bytes)
    },
  })
}

export interface ReleaseAssetSourceOptions {
  /** What to call this source in an error: the release it came from. */
  label: string
  /** The asset's API URL, which is what serves the bytes on a private repo. */
  url: string
  token?: string | null
  fetchImpl?: typeof fetch
}

/**
 * Downloads a `.tar.gz` release asset and serves its files.
 *
 * The asset is fetched through the API URL with `application/octet-stream`, not through
 * `browser_download_url`: the latter is a redirect to unauthenticated storage, which a private
 * repo answers with a 404.
 */
export async function releaseTarballSource({
  label,
  url,
  token,
  fetchImpl = (...args) => fetch(...args),
}: ReleaseAssetSourceOptions): Promise<FileSource> {
  const res = await fetchImpl(url, {
    headers: {
      Accept: "application/octet-stream",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`)
  const entries = readTar(await gunzip(new Uint8Array(await res.arrayBuffer())))
  if (entries.size === 0) throw new Error(`${label}: archive carries no files`)
  return tarFileSource(label, entries)
}
