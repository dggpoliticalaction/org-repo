import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`resource_categories_breadcrumbs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`doc_id\` integer,
  	\`url\` text,
  	\`label\` text,
  	FOREIGN KEY (\`doc_id\`) REFERENCES \`resource_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resource_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resource_categories_breadcrumbs_order_idx\` ON \`resource_categories_breadcrumbs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resource_categories_breadcrumbs_parent_id_idx\` ON \`resource_categories_breadcrumbs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`resource_categories_breadcrumbs_doc_idx\` ON \`resource_categories_breadcrumbs\` (\`doc_id\`);`)
  await db.run(sql`ALTER TABLE \`resource_categories\` ADD \`parent_id\` integer REFERENCES resource_categories(id);`)
  await db.run(sql`CREATE INDEX \`resource_categories_parent_idx\` ON \`resource_categories\` (\`parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`resource_categories_breadcrumbs\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_resource_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text,
  	\`slug_lock\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_resource_categories\`("id", "title", "slug", "slug_lock", "updated_at", "created_at") SELECT "id", "title", "slug", "slug_lock", "updated_at", "created_at" FROM \`resource_categories\`;`)
  await db.run(sql`DROP TABLE \`resource_categories\`;`)
  await db.run(sql`ALTER TABLE \`__new_resource_categories\` RENAME TO \`resource_categories\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`resource_categories_slug_idx\` ON \`resource_categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`resource_categories_updated_at_idx\` ON \`resource_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`resource_categories_created_at_idx\` ON \`resource_categories\` (\`created_at\`);`)
}
