import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_collection_grid" ALTER COLUMN "layout" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_collection_grid" ALTER COLUMN "layout" DROP DEFAULT;
  ALTER TABLE "media" ADD COLUMN "blur_data_u_r_l" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_collection_grid" ALTER COLUMN "layout" SET DEFAULT 'vespucci-7';
  ALTER TABLE "_pages_v_blocks_collection_grid" ALTER COLUMN "layout" SET DEFAULT 'vespucci-7';
  ALTER TABLE "media" DROP COLUMN "blur_data_u_r_l";`)
}
