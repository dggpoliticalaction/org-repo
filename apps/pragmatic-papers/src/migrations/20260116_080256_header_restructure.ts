import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_secondary_menu_link_type" AS ENUM('reference', 'custom');
  ALTER TYPE "public"."enum_header_nav_items_link_type" RENAME TO "enum_header_primary_menu_link_type";
  CREATE TABLE "header_secondary_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_secondary_menu_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  ALTER TABLE "header_nav_items" RENAME TO "header_primary_menu";
  ALTER TABLE "header_primary_menu" DROP CONSTRAINT "header_nav_items_parent_id_fk";
  
  DROP INDEX "header_nav_items_order_idx";
  DROP INDEX "header_nav_items_parent_id_idx";
  ALTER TABLE "header_secondary_menu" ADD CONSTRAINT "header_secondary_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_secondary_menu_order_idx" ON "header_secondary_menu" USING btree ("_order");
  CREATE INDEX "header_secondary_menu_parent_id_idx" ON "header_secondary_menu" USING btree ("_parent_id");
  ALTER TABLE "header_primary_menu" ADD CONSTRAINT "header_primary_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_primary_menu_order_idx" ON "header_primary_menu" USING btree ("_order");
  CREATE INDEX "header_primary_menu_parent_id_idx" ON "header_primary_menu" USING btree ("_parent_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_header_primary_menu_link_type" RENAME TO "enum_header_nav_items_link_type";
  ALTER TABLE "header_secondary_menu" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "header_secondary_menu" CASCADE;
  ALTER TABLE "header_primary_menu" RENAME TO "header_nav_items";
  ALTER TABLE "header_nav_items" DROP CONSTRAINT "header_primary_menu_parent_id_fk";
  
  DROP INDEX "header_primary_menu_order_idx";
  DROP INDEX "header_primary_menu_parent_id_idx";
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  DROP TYPE "public"."enum_header_secondary_menu_link_type";`);
}
