export function parsePageNumber(value?: string): number {
  const page = Number(value) || 1
  return Number.isInteger(page) && page > 0 ? page : 1
}
