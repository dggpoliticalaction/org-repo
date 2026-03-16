export function getSeparator(index: number, length: number): string | undefined {
  if (index === 0) return undefined
  if (index === length - 1) return length === 2 ? " and " : ", and "
  return ", "
}
