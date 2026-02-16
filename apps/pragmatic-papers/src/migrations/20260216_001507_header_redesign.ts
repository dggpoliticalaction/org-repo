import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_action_button_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_header_action_button_variant" AS ENUM('default', 'outline', 'ghost', 'link');
  ALTER TABLE "header" ALTER COLUMN "action_button_enabled" DROP NOT NULL;
  ALTER TABLE "header" ADD COLUMN "action_button_link_appearance" "enum_header_action_button_link_appearance" DEFAULT 'default';
  ALTER TABLE "header" ADD COLUMN "action_button_variant" "enum_header_action_button_variant" DEFAULT 'default';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header" ALTER COLUMN "action_button_enabled" SET NOT NULL;
  ALTER TABLE "header" DROP COLUMN "action_button_link_appearance";
  ALTER TABLE "header" DROP COLUMN "action_button_variant";
  DROP TYPE "public"."enum_header_action_button_link_appearance";
  DROP TYPE "public"."enum_header_action_button_variant";`)
}
