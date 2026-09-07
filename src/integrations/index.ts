import { githubRepo } from "./github"
import { shopifyStore } from "./shopify"
import { integrationStatus, type Integration, type IntegrationStatus } from "./types"

/**
 * Every outside connection this site has, declared in one place.
 *
 * A feature imports the connection it needs by name and asks it for what it wants — this list
 * exists so that "which integrations do we have, and are they connected?" has an answer that
 * does not involve grepping for `process.env`. It is a plain array rather than a runtime
 * registry on purpose: a `register()` API designed against two connections would encode the
 * accidents of those two, and an array a config maps over is all an admin panel needs
 * (issue #912).
 *
 * Adding one: declare it here, next to its peers, and export it for its feature to import.
 */

/**
 * court-tracker — the federal judiciary dataset behind the Federal Courts interactive. A
 * private repository that publishes a tagged, immutable release per data build; the
 * interactive's feed adapter (`interactives/federal-courts/feed.ts`) is what knows the shape
 * of what it publishes.
 */
export const courtTracker = githubRepo({
  id: "github-court-tracker",
  label: "court-tracker data feed",
  defaultRepo: "digitalgroundgame/court-tracker",
  repoEnv: "COURT_TRACKER_REPO",
  tokenEnv: "COURT_TRACKER_GITHUB_TOKEN",
})

export { shopifyStore }

/** Declaration order is display order. */
export const INTEGRATIONS: readonly Integration[] = [courtTracker, shopifyStore]

export function getIntegration(id: string): Integration | null {
  return INTEGRATIONS.find((i) => i.id === id) ?? null
}

/** What every connection reports about itself right now. Names of missing vars, never values. */
export function integrationStatuses(): IntegrationStatus[] {
  return INTEGRATIONS.map(integrationStatus)
}

export type { Integration, IntegrationStatus } from "./types"
export { describeStatus, integrationStatus } from "./types"
