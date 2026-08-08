import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "project_units" ADD COLUMN "seo_og_image_id" integer;
  ALTER TABLE "project_units" ADD COLUMN "seo_noindex" boolean DEFAULT false;
  ALTER TABLE "project_units_locales" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "project_units_locales" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "_project_units_v" ADD COLUMN "version_seo_og_image_id" integer;
  ALTER TABLE "_project_units_v" ADD COLUMN "version_seo_noindex" boolean DEFAULT false;
  ALTER TABLE "_project_units_v_locales" ADD COLUMN "version_seo_meta_title" varchar;
  ALTER TABLE "_project_units_v_locales" ADD COLUMN "version_seo_meta_description" varchar;
  ALTER TABLE "project_units" ADD CONSTRAINT "project_units_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_project_units_v" ADD CONSTRAINT "_project_units_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "project_units_seo_seo_og_image_idx" ON "project_units" USING btree ("seo_og_image_id");
  CREATE INDEX "_project_units_v_version_seo_version_seo_og_image_idx" ON "_project_units_v" USING btree ("version_seo_og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "project_units" DROP CONSTRAINT "project_units_seo_og_image_id_media_id_fk";
  
  ALTER TABLE "_project_units_v" DROP CONSTRAINT "_project_units_v_version_seo_og_image_id_media_id_fk";
  
  DROP INDEX "project_units_seo_seo_og_image_idx";
  DROP INDEX "_project_units_v_version_seo_version_seo_og_image_idx";
  ALTER TABLE "project_units" DROP COLUMN "seo_og_image_id";
  ALTER TABLE "project_units" DROP COLUMN "seo_noindex";
  ALTER TABLE "project_units_locales" DROP COLUMN "seo_meta_title";
  ALTER TABLE "project_units_locales" DROP COLUMN "seo_meta_description";
  ALTER TABLE "_project_units_v" DROP COLUMN "version_seo_og_image_id";
  ALTER TABLE "_project_units_v" DROP COLUMN "version_seo_noindex";
  ALTER TABLE "_project_units_v_locales" DROP COLUMN "version_seo_meta_title";
  ALTER TABLE "_project_units_v_locales" DROP COLUMN "version_seo_meta_description";`)
}
