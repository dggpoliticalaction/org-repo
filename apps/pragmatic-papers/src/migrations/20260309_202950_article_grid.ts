import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_article_grid_layout" AS ENUM('vespucci-7', 'fibonacci-7');
  CREATE TYPE "public"."enum__pages_v_blocks_article_grid_layout" AS ENUM('vespucci-7', 'fibonacci-7');
  CREATE TABLE "pages_blocks_article_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_pages_blocks_article_grid_layout" DEFAULT 'vespucci-7',
  	"slots_featured_article_id" integer,
  	"slots_featured_kicker" varchar,
  	"slots_featured_override_title" varchar,
  	"slots_a_article_id" integer,
  	"slots_a_kicker" varchar,
  	"slots_a_override_title" varchar,
  	"slots_b_article_id" integer,
  	"slots_b_kicker" varchar,
  	"slots_b_override_title" varchar,
  	"slots_c_article_id" integer,
  	"slots_c_kicker" varchar,
  	"slots_c_override_title" varchar,
  	"slots_d_article_id" integer,
  	"slots_d_kicker" varchar,
  	"slots_d_override_title" varchar,
  	"slots_e_article_id" integer,
  	"slots_e_kicker" varchar,
  	"slots_e_override_title" varchar,
  	"slots_f_article_id" integer,
  	"slots_f_kicker" varchar,
  	"slots_f_override_title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_article_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__pages_v_blocks_article_grid_layout" DEFAULT 'vespucci-7',
  	"slots_featured_article_id" integer,
  	"slots_featured_kicker" varchar,
  	"slots_featured_override_title" varchar,
  	"slots_a_article_id" integer,
  	"slots_a_kicker" varchar,
  	"slots_a_override_title" varchar,
  	"slots_b_article_id" integer,
  	"slots_b_kicker" varchar,
  	"slots_b_override_title" varchar,
  	"slots_c_article_id" integer,
  	"slots_c_kicker" varchar,
  	"slots_c_override_title" varchar,
  	"slots_d_article_id" integer,
  	"slots_d_kicker" varchar,
  	"slots_d_override_title" varchar,
  	"slots_e_article_id" integer,
  	"slots_e_kicker" varchar,
  	"slots_e_override_title" varchar,
  	"slots_f_article_id" integer,
  	"slots_f_kicker" varchar,
  	"slots_f_override_title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "header" ALTER COLUMN "action_button_enabled" SET NOT NULL;
  ALTER TABLE "pages_blocks_article_grid" ADD CONSTRAINT "pages_blocks_article_grid_slots_featured_article_id_articles_id_fk" FOREIGN KEY ("slots_featured_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_grid" ADD CONSTRAINT "pages_blocks_article_grid_slots_a_article_id_articles_id_fk" FOREIGN KEY ("slots_a_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_grid" ADD CONSTRAINT "pages_blocks_article_grid_slots_b_article_id_articles_id_fk" FOREIGN KEY ("slots_b_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_grid" ADD CONSTRAINT "pages_blocks_article_grid_slots_c_article_id_articles_id_fk" FOREIGN KEY ("slots_c_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_grid" ADD CONSTRAINT "pages_blocks_article_grid_slots_d_article_id_articles_id_fk" FOREIGN KEY ("slots_d_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_grid" ADD CONSTRAINT "pages_blocks_article_grid_slots_e_article_id_articles_id_fk" FOREIGN KEY ("slots_e_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_grid" ADD CONSTRAINT "pages_blocks_article_grid_slots_f_article_id_articles_id_fk" FOREIGN KEY ("slots_f_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_grid" ADD CONSTRAINT "pages_blocks_article_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_grid" ADD CONSTRAINT "_pages_v_blocks_article_grid_slots_featured_article_id_articles_id_fk" FOREIGN KEY ("slots_featured_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_grid" ADD CONSTRAINT "_pages_v_blocks_article_grid_slots_a_article_id_articles_id_fk" FOREIGN KEY ("slots_a_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_grid" ADD CONSTRAINT "_pages_v_blocks_article_grid_slots_b_article_id_articles_id_fk" FOREIGN KEY ("slots_b_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_grid" ADD CONSTRAINT "_pages_v_blocks_article_grid_slots_c_article_id_articles_id_fk" FOREIGN KEY ("slots_c_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_grid" ADD CONSTRAINT "_pages_v_blocks_article_grid_slots_d_article_id_articles_id_fk" FOREIGN KEY ("slots_d_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_grid" ADD CONSTRAINT "_pages_v_blocks_article_grid_slots_e_article_id_articles_id_fk" FOREIGN KEY ("slots_e_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_grid" ADD CONSTRAINT "_pages_v_blocks_article_grid_slots_f_article_id_articles_id_fk" FOREIGN KEY ("slots_f_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_grid" ADD CONSTRAINT "_pages_v_blocks_article_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_article_grid_order_idx" ON "pages_blocks_article_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_article_grid_parent_id_idx" ON "pages_blocks_article_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_article_grid_path_idx" ON "pages_blocks_article_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_article_grid_slots_featured_slots_featured__idx" ON "pages_blocks_article_grid" USING btree ("slots_featured_article_id");
  CREATE INDEX "pages_blocks_article_grid_slots_a_slots_a_article_idx" ON "pages_blocks_article_grid" USING btree ("slots_a_article_id");
  CREATE INDEX "pages_blocks_article_grid_slots_b_slots_b_article_idx" ON "pages_blocks_article_grid" USING btree ("slots_b_article_id");
  CREATE INDEX "pages_blocks_article_grid_slots_c_slots_c_article_idx" ON "pages_blocks_article_grid" USING btree ("slots_c_article_id");
  CREATE INDEX "pages_blocks_article_grid_slots_d_slots_d_article_idx" ON "pages_blocks_article_grid" USING btree ("slots_d_article_id");
  CREATE INDEX "pages_blocks_article_grid_slots_e_slots_e_article_idx" ON "pages_blocks_article_grid" USING btree ("slots_e_article_id");
  CREATE INDEX "pages_blocks_article_grid_slots_f_slots_f_article_idx" ON "pages_blocks_article_grid" USING btree ("slots_f_article_id");
  CREATE INDEX "_pages_v_blocks_article_grid_order_idx" ON "_pages_v_blocks_article_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_article_grid_parent_id_idx" ON "_pages_v_blocks_article_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_article_grid_path_idx" ON "_pages_v_blocks_article_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_article_grid_slots_featured_slots_featur_idx" ON "_pages_v_blocks_article_grid" USING btree ("slots_featured_article_id");
  CREATE INDEX "_pages_v_blocks_article_grid_slots_a_slots_a_article_idx" ON "_pages_v_blocks_article_grid" USING btree ("slots_a_article_id");
  CREATE INDEX "_pages_v_blocks_article_grid_slots_b_slots_b_article_idx" ON "_pages_v_blocks_article_grid" USING btree ("slots_b_article_id");
  CREATE INDEX "_pages_v_blocks_article_grid_slots_c_slots_c_article_idx" ON "_pages_v_blocks_article_grid" USING btree ("slots_c_article_id");
  CREATE INDEX "_pages_v_blocks_article_grid_slots_d_slots_d_article_idx" ON "_pages_v_blocks_article_grid" USING btree ("slots_d_article_id");
  CREATE INDEX "_pages_v_blocks_article_grid_slots_e_slots_e_article_idx" ON "_pages_v_blocks_article_grid" USING btree ("slots_e_article_id");
  CREATE INDEX "_pages_v_blocks_article_grid_slots_f_slots_f_article_idx" ON "_pages_v_blocks_article_grid" USING btree ("slots_f_article_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_article_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_article_grid" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_article_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_article_grid" CASCADE;
  ALTER TABLE "header" ALTER COLUMN "action_button_enabled" DROP NOT NULL;
  DROP TYPE "public"."enum_pages_blocks_article_grid_layout";
  DROP TYPE "public"."enum__pages_v_blocks_article_grid_layout";`)
}
