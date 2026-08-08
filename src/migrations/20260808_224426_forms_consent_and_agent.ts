import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "agent_id" integer;
  ALTER TABLE "_projects_v" ADD COLUMN "version_agent_id" integer;
  ALTER TABLE "listing_requests" ADD COLUMN "ip_hash" varchar;
  ALTER TABLE "enquiries" ADD COLUMN "terms_accepted_at" timestamp(3) with time zone;
  ALTER TABLE "enquiries" ADD COLUMN "ip_hash" varchar;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_agent_id_users_id_fk" FOREIGN KEY ("version_agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects_agent_idx" ON "projects" USING btree ("agent_id");
  CREATE INDEX "_projects_v_version_version_agent_idx" ON "_projects_v" USING btree ("version_agent_id");
  CREATE INDEX "listing_requests_ip_hash_idx" ON "listing_requests" USING btree ("ip_hash");
  CREATE INDEX "enquiries_ip_hash_idx" ON "enquiries" USING btree ("ip_hash");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP CONSTRAINT "projects_agent_id_users_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_agent_id_users_id_fk";
  
  DROP INDEX "projects_agent_idx";
  DROP INDEX "_projects_v_version_version_agent_idx";
  DROP INDEX "listing_requests_ip_hash_idx";
  DROP INDEX "enquiries_ip_hash_idx";
  ALTER TABLE "projects" DROP COLUMN "agent_id";
  ALTER TABLE "_projects_v" DROP COLUMN "version_agent_id";
  ALTER TABLE "listing_requests" DROP COLUMN "ip_hash";
  ALTER TABLE "enquiries" DROP COLUMN "terms_accepted_at";
  ALTER TABLE "enquiries" DROP COLUMN "ip_hash";`)
}
