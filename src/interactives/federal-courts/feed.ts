import { githubFileSource, type FileSource } from "../sources/files"
import { latestTaggedRelease, RELEASE_REF, type ReleaseRef } from "../sources/releases"
import { releaseTarballSource } from "../sources/tarball"
import type { FeedAdapter, FeedFetchOptions, FeedSnapshot } from "../types"
import { adaptCourtTracker } from "./adapter"
import type {
  Appointment,
  Court,
  CourtTrackerSources,
  DistrictArrangement,
  Judge,
  Justice,
  Manifest,
  PresidentPhoto,
  SeatBlock,
} from "./upstream"

/** Upstream tags every manifest bump `data-v<manifest.version>` and cuts a release for it. */
export const COURT_TRACKER_TAG_PREFIX = "data-v"

/**
 * The release asset carrying exactly what we read: every runtime `data/*.json`, at the paths
 * the manifest names, and none of the photos, geometry or widget code that make up ~98% of
 * the full package. Upstream publishes it for a consumer that renders its own map, which is
 * what we are.
 */
export const COURT_TRACKER_JSON_ASSET = "data-json.tar.gz"

/**
 * The shape version we are written against, from upstream's data contract. It is semver over
 * the *shape*, separate from `version`'s content hash, so a MAJOR bump is the one thing that
 * can break this adapter without changing a single number we render.
 */
export const COURT_TRACKER_SCHEMA_MAJOR = 1

export const COURT_TRACKER_REPO_ENV = "COURT_TRACKER_REPO"
export const COURT_TRACKER_TOKEN_ENV = "COURT_TRACKER_GITHUB_TOKEN"
export const DEFAULT_COURT_TRACKER_REPO = "digitalgroundgame/court-tracker"

export function courtTrackerRepo(): string {
  return process.env[COURT_TRACKER_REPO_ENV]?.trim() || DEFAULT_COURT_TRACKER_REPO
}

/** Reads upstream's manifest first, then exactly the files it lists. Geometry is never read. */
export async function readCourtTrackerSources(
  files: FileSource,
): Promise<FeedSnapshot<CourtTrackerSources>> {
  const manifest = await files.readJson<Manifest>("data/manifest.json")
  if (manifest.schema !== "court-tracker/manifest@1") {
    throw new Error(`${files.describe()}: unexpected manifest schema "${manifest.schema}"`)
  }
  // Upstream versions the shape of the data separately from its content, so a MAJOR bump is a
  // contract change: a closed enum gained a value, a field changed type, a file went away.
  // Refuse it here, where the message can say so, rather than downstream where it arrives as
  // a validation error about a region. An older manifest carries no schema version at all.
  const major = Number.parseInt(manifest.schema_version ?? "", 10)
  if (Number.isFinite(major) && major !== COURT_TRACKER_SCHEMA_MAJOR) {
    throw new Error(
      `${files.describe()}: data schema ${manifest.schema_version} is not the ${COURT_TRACKER_SCHEMA_MAJOR}.x this adapter reads — see the feed's SCHEMA_CHANGELOG before bumping COURT_TRACKER_SCHEMA_MAJOR`,
    )
  }
  const f = manifest.files
  const optional = async <T>(path: string | undefined): Promise<T | null> =>
    path ? files.readJson<T>(path) : null

  const [courts, seatBlocks, justices, presidents, arrangement, appointments] = await Promise.all([
    files.readJson<Court[]>(f.courts),
    files.readJson<Record<string, SeatBlock>>(f.seat_blocks),
    files.readJson<Justice[]>(f.circuit_justices),
    optional<Record<string, PresidentPhoto>>(f.president_photos),
    optional<DistrictArrangement>(f.district_arrangement),
    optional<Appointment[]>(f.appointments),
  ])
  const judges: Record<string, Judge[]> = {}
  await Promise.all(
    Object.entries(f.judges).map(async ([bundle, path]) => {
      judges[bundle] = await files.readJson<Judge[]>(path)
    }),
  )
  return {
    version: manifest.version,
    generatedAt: manifest.generated,
    raw: { manifest, courts, seatBlocks, justices, judges, presidents, arrangement, appointments },
  }
}

/**
 * The revision to read. Upstream asks consumers not to read `main`, because a scheduled pull
 * can catch it mid-push or catch `data/` and `assets/geo/` disagreeing across two commits;
 * every manifest bump cuts an immutable `data-v<version>` release instead. A caller that pins
 * something else is honoured, and a repo that has published no release yet falls back to the
 * default branch so this keeps working before upstream's release workflow lands.
 */
async function resolveRef(
  opts: FeedFetchOptions,
): Promise<{ ref: string; release: ReleaseRef | null }> {
  if (opts.ref !== RELEASE_REF && opts.ref !== "") return { ref: opts.ref, release: null }
  const release = await latestTaggedRelease({
    repo: courtTrackerRepo(),
    tagPrefix: COURT_TRACKER_TAG_PREFIX,
    token: opts.token,
    fetchImpl: opts.fetchImpl,
  })
  return { ref: release?.tag ?? "main", release }
}

function sourceAt(ref: string, opts: FeedFetchOptions): FileSource {
  return githubFileSource({
    repo: courtTrackerRepo(),
    ref,
    token: opts.token,
    fetchImpl: opts.fetchImpl,
  })
}

/**
 * Where one fetch reads its files from. A release that attaches the JSON archive is read as
 * the archive — one request for the whole feed, and no way to see two files from two builds.
 * A pinned ref, or a release cut before upstream published that asset, is read file by file
 * at the ref instead, which is the same bytes for more round trips.
 */
async function resolveSource(opts: FeedFetchOptions): Promise<{ ref: string; files: FileSource }> {
  const { ref, release } = await resolveRef(opts)
  const asset = release?.assets.find((a) => a.name === COURT_TRACKER_JSON_ASSET)
  if (!asset) return { ref, files: sourceAt(ref, opts) }
  const files = await releaseTarballSource({
    label: `github:${courtTrackerRepo()}@${release!.tag} ${asset.name}`,
    url: asset.url,
    token: opts.token,
    fetchImpl: opts.fetchImpl,
  })
  return { ref, files }
}

/**
 * The Federal Courts feed. The researcher's manifest is the contract: its `version` says
 * whether anything moved, its `files` say what to read. Nothing here asks the researcher to
 * change what they publish.
 */
export const courtTrackerFeed: FeedAdapter<CourtTrackerSources> = {
  tokenEnv: COURT_TRACKER_TOKEN_ENV,
  describe: () => `github:${courtTrackerRepo()}`,

  async peekVersion(opts) {
    if (opts.files) return (await opts.files.readJson<Manifest>("data/manifest.json")).version
    // A release tag carries the version, so the cheap poll is one request and never reads a
    // branch. Only a repo with no release yet has to open the manifest to answer this.
    const { ref, release } = await resolveRef(opts)
    if (release) return release.version
    return (await sourceAt(ref, opts).readJson<Manifest>("data/manifest.json")).version
  },

  async fetch(opts) {
    if (opts.files) return readCourtTrackerSources(opts.files)
    const { ref, files } = await resolveSource(opts)
    const snapshot = await readCourtTrackerSources(files)
    return { ...snapshot, ref }
  },

  adapt: adaptCourtTracker,
}
