// supports: file:./data/app.db  |  file:/absolute/path/app.db
export function sqlitePathFromUri(uri: string): string {
  if (uri.startsWith('file:')) return uri.slice('file:'.length)
  return uri
}
