import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`header\` ADD \`organization_name\` text DEFAULT 'DGG Political Action';`)
  await db.run(sql`ALTER TABLE \`header\` ADD \`sticky_header\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`header\` ADD \`discord_link\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`header\` DROP COLUMN \`organization_name\`;`)
  await db.run(sql`ALTER TABLE \`header\` DROP COLUMN \`sticky_header\`;`)
  await db.run(sql`ALTER TABLE \`header\` DROP COLUMN \`discord_link\`;`)
}
