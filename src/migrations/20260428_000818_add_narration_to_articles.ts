import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_users_role" ADD VALUE 'narrator' BEFORE 'member';
  CREATE TABLE "narrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"narrator_id" integer,
  	"transcript" varchar,
  	"duration" numeric,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "articles" ADD COLUMN "narration_id" integer;
  ALTER TABLE "_articles_v" ADD COLUMN "version_narration_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "narrations_id" integer;
  ALTER TABLE "narrations" ADD CONSTRAINT "narrations_narrator_id_users_id_fk" FOREIGN KEY ("narrator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "narrations" ADD CONSTRAINT "narrations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "narrations_narrator_idx" ON "narrations" USING btree ("narrator_id");
  CREATE INDEX "narrations_created_by_idx" ON "narrations" USING btree ("created_by_id");
  CREATE INDEX "narrations_updated_at_idx" ON "narrations" USING btree ("updated_at");
  CREATE INDEX "narrations_created_at_idx" ON "narrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "narrations_filename_idx" ON "narrations" USING btree ("filename");
  ALTER TABLE "articles" ADD CONSTRAINT "articles_narration_id_narrations_id_fk" FOREIGN KEY ("narration_id") REFERENCES "public"."narrations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_narration_id_narrations_id_fk" FOREIGN KEY ("version_narration_id") REFERENCES "public"."narrations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_narrations_fk" FOREIGN KEY ("narrations_id") REFERENCES "public"."narrations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_narration_idx" ON "articles" USING btree ("narration_id");
  CREATE INDEX "_articles_v_version_version_narration_idx" ON "_articles_v" USING btree ("version_narration_id");
  CREATE INDEX "payload_locked_documents_rels_narrations_id_idx" ON "payload_locked_documents_rels" USING btree ("narrations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "narrations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "narrations" CASCADE;
  ALTER TABLE "articles" DROP CONSTRAINT "articles_narration_id_narrations_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_narration_id_narrations_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_narrations_fk";
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'member'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'chief-editor', 'editor', 'writer', 'member');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  DROP INDEX "articles_narration_idx";
  DROP INDEX "_articles_v_version_version_narration_idx";
  DROP INDEX "payload_locked_documents_rels_narrations_id_idx";
  ALTER TABLE "articles" DROP COLUMN "narration_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_narration_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "narrations_id";`)
}
