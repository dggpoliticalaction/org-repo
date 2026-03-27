import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "article_recommendations_rankings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"article_id" integer NOT NULL,
  	"engagement_score" numeric NOT NULL
  );
  
  CREATE TABLE "article_recommendations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"last_updated" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "article_recommendations_rankings" ADD CONSTRAINT "article_recommendations_rankings_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "article_recommendations_rankings" ADD CONSTRAINT "article_recommendations_rankings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_recommendations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "article_recommendations_rankings_order_idx" ON "article_recommendations_rankings" USING btree ("_order");
  CREATE INDEX "article_recommendations_rankings_parent_id_idx" ON "article_recommendations_rankings" USING btree ("_parent_id");
  CREATE INDEX "article_recommendations_rankings_article_idx" ON "article_recommendations_rankings" USING btree ("article_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "article_recommendations_rankings" CASCADE;
  DROP TABLE "article_recommendations" CASCADE;`)
}
