export interface EventHandler {
  process(...args: unknown[]): Promise<void>
}
