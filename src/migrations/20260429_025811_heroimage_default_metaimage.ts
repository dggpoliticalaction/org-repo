import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" ADD COLUMN "meta_use_hero_image" boolean DEFAULT true;
  ALTER TABLE "_articles_v" ADD COLUMN "version_meta_use_hero_image" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" DROP COLUMN "meta_use_hero_image";
  ALTER TABLE "_articles_v" DROP COLUMN "version_meta_use_hero_image";`)
}
