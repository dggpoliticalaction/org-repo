/**
 * Integrations: the outside services this site reads from and writes to.
 *
 * An integration is one **connection**, not a vendor in the abstract. Two GitHub repositories
 * read with two different tokens are two connections; a Shopify store is one. Each is declared
 * once in `./index`, points at exactly one place, and answers for itself whether it is usable.
 *
 * The shared contract is deliberately thin — identity, the environment it needs, and a probe.
 * What a connection *does* is its own API, because a Storefront catalogue and a tagged data
 * release have nothing in common except that reading either needs a credential and can fail.
 * Forcing a common `sync()` on them would encode the accidents of whichever two came first
 * (issue #912 makes the same argument from the admin panel's side).
 *
 * **Secrets stay in the environment.** A connection names the variables it needs and reports
 * which are missing; it never reports a value, and nothing here writes a credential to the
 * database. That keeps a database backup from becoming a credential store, and still answers
 * the question an editor actually asks: is this connected?
 */

export interface Integration {
  /** Stable id — used in logs, and by the admin status view when one exists. */
  id: string
  /** What a person calls it. */
  label: string
  /** The service behind the connection: "GitHub", "Shopify". */
  service: string
  /**
   * What this connection points at, for a log line or a status row: `github:org/repo`,
   * `shopify:store.myshopify.com`. Never a credential, and safe to print anywhere.
   */
  describe(): string
  /** Environment variables without which this connection cannot work at all. */
  required: readonly string[]
  /** Variables that widen what it can do — a token that opens a private repository. */
  optional?: readonly string[]
  /**
   * Whether the connection is usable. Defaults to "every required variable is set"; a
   * connection overrides it when being configured means more than that — Shopify's store
   * domain has to parse as a host, not merely be non-empty.
   */
  isConfigured?(): boolean
}

export interface IntegrationStatus {
  id: string
  label: string
  service: string
  /** The connection's own `describe()`. */
  target: string
  configured: boolean
  /** Names of required variables that are not set. Names only, never values. */
  missing: string[]
  /** Names of optional variables that are not set, so a log can say why a read is limited. */
  unset: string[]
}

const isSet = (name: string): boolean => (process.env[name]?.trim() ?? "") !== ""

/**
 * What one connection reports about itself. Reads the environment on every call rather than
 * at import: a status probe that answers from a value captured at boot is a status probe that
 * lies after a redeploy changes one.
 */
export function integrationStatus(integration: Integration): IntegrationStatus {
  const missing = integration.required.filter((name) => !isSet(name))
  return {
    id: integration.id,
    label: integration.label,
    service: integration.service,
    target: integration.describe(),
    configured: integration.isConfigured ? integration.isConfigured() : missing.length === 0,
    missing,
    unset: (integration.optional ?? []).filter((name) => !isSet(name)),
  }
}

/** One line for a log: what is missing, or that nothing is. */
export function describeStatus(status: IntegrationStatus): string {
  if (status.configured) return `${status.target} is configured`
  return `${status.target} is not configured — set ${status.missing.join(", ") || "its credentials"}`
}

/** The value of an environment variable, trimmed, or null when it is unset or empty. */
export function env(name: string): string | null {
  const value = process.env[name]?.trim()
  return value ? value : null
}
