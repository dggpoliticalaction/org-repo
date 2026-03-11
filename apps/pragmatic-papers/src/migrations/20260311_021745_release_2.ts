import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_socials_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_action_button_variant" AS ENUM('default', 'outline', 'ghost', 'link');
  CREATE TABLE "users_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_users_socials_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"volumes_id" integer,
  	"articles_id" integer
  );
  
  CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "volumes" RENAME COLUMN "slug_lock" TO "generate_slug";
  DROP INDEX "volumes_slug_idx";
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "footer_nav_items" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "articles" ADD COLUMN "enable_math_rendering" boolean DEFAULT false;
  ALTER TABLE "articles_rels" ADD COLUMN "topics_id" integer;
  ALTER TABLE "_articles_v" ADD COLUMN "version_enable_math_rendering" boolean DEFAULT false;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "topics_id" integer;
  ALTER TABLE "volumes" ADD COLUMN "auto_generate_title" boolean DEFAULT true;
  ALTER TABLE "_volumes_v" ADD COLUMN "version_auto_generate_title" boolean DEFAULT true;
  ALTER TABLE "_volumes_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "affiliation" varchar;
  ALTER TABLE "users" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "users" ADD COLUMN "profile_image_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "topics_id" integer;
  ALTER TABLE "header" ADD COLUMN "action_button_variant" "enum_header_action_button_variant" DEFAULT 'default';
  ALTER TABLE "users_socials" ADD CONSTRAINT "users_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_volumes_fk" FOREIGN KEY ("volumes_id") REFERENCES "public"."volumes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_socials_order_idx" ON "users_socials" USING btree ("_order");
  CREATE INDEX "users_socials_parent_id_idx" ON "users_socials" USING btree ("_parent_id");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_pages_id_idx" ON "users_rels" USING btree ("pages_id");
  CREATE INDEX "users_rels_volumes_id_idx" ON "users_rels" USING btree ("volumes_id");
  CREATE INDEX "users_rels_articles_id_idx" ON "users_rels" USING btree ("articles_id");
  CREATE UNIQUE INDEX "topics_name_idx" ON "topics" USING btree ("name");
  CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_rels_topics_id_idx" ON "articles_rels" USING btree ("topics_id");
  CREATE INDEX "_articles_v_rels_topics_id_idx" ON "_articles_v_rels" USING btree ("topics_id");
  CREATE UNIQUE INDEX "users_slug_idx" ON "users" USING btree ("slug");
  CREATE INDEX "users_profile_image_idx" ON "users" USING btree ("profile_image_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE UNIQUE INDEX "volumes_slug_idx" ON "volumes" USING btree ("slug");
  ALTER TABLE "articles_footnotes" DROP COLUMN "link_appearance";
  ALTER TABLE "_articles_v_version_footnotes" DROP COLUMN "link_appearance";
  ALTER TABLE "_volumes_v" DROP COLUMN "version_slug_lock";
  DROP TYPE "public"."enum_articles_footnotes_link_appearance";
  DROP TYPE "public"."enum__articles_v_version_footnotes_link_appearance";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_footnotes_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__articles_v_version_footnotes_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "users_socials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "topics" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_socials" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "topics" CASCADE;
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_topics_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_topics_fk";
  
  ALTER TABLE "users" DROP CONSTRAINT "users_profile_image_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_topics_fk";
  
  DROP INDEX "articles_rels_topics_id_idx";
  DROP INDEX "_articles_v_rels_topics_id_idx";
  DROP INDEX "users_slug_idx";
  DROP INDEX "users_profile_image_idx";
  DROP INDEX "payload_locked_documents_rels_topics_id_idx";
  DROP INDEX "volumes_slug_idx";
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "footer_nav_items" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "articles_footnotes" ADD COLUMN "link_appearance" "enum_articles_footnotes_link_appearance" DEFAULT 'default';
  ALTER TABLE "_articles_v_version_footnotes" ADD COLUMN "link_appearance" "enum__articles_v_version_footnotes_link_appearance" DEFAULT 'default';
  ALTER TABLE "volumes" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "_volumes_v" ADD COLUMN "version_slug_lock" boolean DEFAULT true;
  CREATE INDEX "volumes_slug_idx" ON "volumes" USING btree ("slug");
  ALTER TABLE "articles" DROP COLUMN "enable_math_rendering";
  ALTER TABLE "articles_rels" DROP COLUMN "topics_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_enable_math_rendering";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "topics_id";
  ALTER TABLE "volumes" DROP COLUMN "auto_generate_title";
  ALTER TABLE "volumes" DROP COLUMN "generate_slug";
  ALTER TABLE "_volumes_v" DROP COLUMN "version_auto_generate_title";
  ALTER TABLE "_volumes_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "users" DROP COLUMN "affiliation";
  ALTER TABLE "users" DROP COLUMN "generate_slug";
  ALTER TABLE "users" DROP COLUMN "slug";
  ALTER TABLE "users" DROP COLUMN "profile_image_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "topics_id";
  ALTER TABLE "header" DROP COLUMN "action_button_variant";
  DROP TYPE "public"."enum_users_socials_link_type";
  DROP TYPE "public"."enum_header_action_button_variant";`)
}
