export async function register(): Promise<void> {
  const { bootstrapAuthSchemaOnce } = await import('@/utilities/bootstrapAuthSchemaOnce')
  await bootstrapAuthSchemaOnce()
}
