import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('sq', 'en', 'it');
  CREATE TYPE "public"."enum_properties_orientation" AS ENUM('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW');
  CREATE TYPE "public"."enum_properties_features" AS ENUM('parking', 'elevator', 'balcony', 'terrace', 'garden', 'pool', 'furnished', 'seaView', 'cityView', 'lakeView', 'heating', 'airConditioning', 'security', 'storage', 'streetFront');
  CREATE TYPE "public"."enum_properties_property_type" AS ENUM('apartment', 'villa', 'house', 'shop', 'office', 'warehouse', 'land');
  CREATE TYPE "public"."enum_properties_currency" AS ENUM('EUR', 'ALL');
  CREATE TYPE "public"."enum_properties_rent_period" AS ENUM('monthly', 'nightly');
  CREATE TYPE "public"."enum_properties_listing_type" AS ENUM('sale', 'rent');
  CREATE TYPE "public"."listing_status" AS ENUM('available', 'reserved', 'sold');
  CREATE TYPE "public"."enum_properties_building_phase" AS ENUM('brick', 'facade', 'finished', 'existing');
  CREATE TYPE "public"."enum_properties_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__properties_v_version_orientation" AS ENUM('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW');
  CREATE TYPE "public"."enum__properties_v_version_features" AS ENUM('parking', 'elevator', 'balcony', 'terrace', 'garden', 'pool', 'furnished', 'seaView', 'cityView', 'lakeView', 'heating', 'airConditioning', 'security', 'storage', 'streetFront');
  CREATE TYPE "public"."enum__properties_v_version_property_type" AS ENUM('apartment', 'villa', 'house', 'shop', 'office', 'warehouse', 'land');
  CREATE TYPE "public"."enum__properties_v_version_currency" AS ENUM('EUR', 'ALL');
  CREATE TYPE "public"."enum__properties_v_version_rent_period" AS ENUM('monthly', 'nightly');
  CREATE TYPE "public"."enum__properties_v_version_listing_type" AS ENUM('sale', 'rent');
  CREATE TYPE "public"."enum__properties_v_version_building_phase" AS ENUM('brick', 'facade', 'finished', 'existing');
  CREATE TYPE "public"."enum__properties_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__properties_v_published_locale" AS ENUM('sq', 'en', 'it');
  CREATE TYPE "public"."enum_project_units_orientation" AS ENUM('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW');
  CREATE TYPE "public"."enum_project_units_features" AS ENUM('parking', 'elevator', 'balcony', 'terrace', 'garden', 'pool', 'furnished', 'seaView', 'cityView', 'lakeView', 'heating', 'airConditioning', 'security', 'storage', 'streetFront');
  CREATE TYPE "public"."enum_project_units_property_type" AS ENUM('apartment', 'villa', 'house', 'shop', 'office', 'warehouse', 'land');
  CREATE TYPE "public"."enum_project_units_currency" AS ENUM('EUR', 'ALL');
  CREATE TYPE "public"."enum_project_units_rent_period" AS ENUM('monthly', 'nightly');
  CREATE TYPE "public"."enum_project_units_listing_type" AS ENUM('sale', 'rent');
  CREATE TYPE "public"."enum_project_units_building_phase" AS ENUM('brick', 'facade', 'finished', 'existing');
  CREATE TYPE "public"."enum_project_units_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__project_units_v_version_orientation" AS ENUM('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW');
  CREATE TYPE "public"."enum__project_units_v_version_features" AS ENUM('parking', 'elevator', 'balcony', 'terrace', 'garden', 'pool', 'furnished', 'seaView', 'cityView', 'lakeView', 'heating', 'airConditioning', 'security', 'storage', 'streetFront');
  CREATE TYPE "public"."enum__project_units_v_version_property_type" AS ENUM('apartment', 'villa', 'house', 'shop', 'office', 'warehouse', 'land');
  CREATE TYPE "public"."enum__project_units_v_version_currency" AS ENUM('EUR', 'ALL');
  CREATE TYPE "public"."enum__project_units_v_version_rent_period" AS ENUM('monthly', 'nightly');
  CREATE TYPE "public"."enum__project_units_v_version_listing_type" AS ENUM('sale', 'rent');
  CREATE TYPE "public"."enum__project_units_v_version_building_phase" AS ENUM('brick', 'facade', 'finished', 'existing');
  CREATE TYPE "public"."enum__project_units_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__project_units_v_published_locale" AS ENUM('sq', 'en', 'it');
  CREATE TYPE "public"."enum_projects_construction_phase" AS ENUM('planning', 'underConstruction', 'completed');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_construction_phase" AS ENUM('planning', 'underConstruction', 'completed');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('sq', 'en', 'it');
  CREATE TYPE "public"."enum_companies_socials_platform" AS ENUM('facebook', 'instagram', 'linkedin', 'youtube', 'tiktok');
  CREATE TYPE "public"."enum_companies_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__companies_v_version_socials_platform" AS ENUM('facebook', 'instagram', 'linkedin', 'youtube', 'tiktok');
  CREATE TYPE "public"."enum__companies_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__companies_v_published_locale" AS ENUM('sq', 'en', 'it');
  CREATE TYPE "public"."enum_areas_kind" AS ENUM('city', 'neighbourhood');
  CREATE TYPE "public"."enum_articles_category" AS ENUM('buying', 'selling', 'investment', 'documentation', 'market', 'projects');
  CREATE TYPE "public"."enum_articles_content_type" AS ENUM('editorial', 'analysis', 'sponsored');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_category" AS ENUM('buying', 'selling', 'investment', 'documentation', 'market', 'projects');
  CREATE TYPE "public"."enum__articles_v_version_content_type" AS ENUM('editorial', 'analysis', 'sponsored');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_published_locale" AS ENUM('sq', 'en', 'it');
  CREATE TYPE "public"."enum_listing_requests_request_status" AS ENUM('new', 'contacted', 'verified', 'published', 'rejected');
  CREATE TYPE "public"."enum_listing_requests_listing_type" AS ENUM('sale', 'rent');
  CREATE TYPE "public"."enum_enquiries_source_type" AS ENUM('property', 'unit', 'project');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'agent', 'client');
  CREATE TABLE "properties_orientation" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_properties_orientation",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "properties_features" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_properties_features",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "properties_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "properties_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "properties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"property_type" "enum_properties_property_type" DEFAULT 'apartment',
  	"price" numeric,
  	"currency" "enum_properties_currency" DEFAULT 'EUR',
  	"price_on_request" boolean DEFAULT false,
  	"price_eur" numeric,
  	"rent_period" "enum_properties_rent_period" DEFAULT 'monthly',
  	"area_gross" numeric,
  	"area_net" numeric,
  	"terrace_sqm" numeric,
  	"common_area_sqm" numeric,
  	"rooms" varchar,
  	"bedrooms" numeric,
  	"bathrooms" numeric,
  	"floor" numeric,
  	"listing_type" "enum_properties_listing_type",
  	"status" "listing_status" DEFAULT 'available',
  	"building_phase" "enum_properties_building_phase",
  	"mortgage_eligible" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"reference" varchar,
  	"area_id" integer,
  	"street" varchar,
  	"landmark" varchar,
  	"location" geometry(Point),
  	"agent_id" integer,
  	"verified" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"owner_name" varchar,
  	"owner_phone" varchar,
  	"internal_notes" varchar,
  	"source_request_id" integer,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_properties_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "properties_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"documentation_note" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_properties_v_version_orientation" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__properties_v_version_orientation",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_properties_v_version_features" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__properties_v_version_features",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_properties_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_properties_v_version_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_properties_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_property_type" "enum__properties_v_version_property_type" DEFAULT 'apartment',
  	"version_price" numeric,
  	"version_currency" "enum__properties_v_version_currency" DEFAULT 'EUR',
  	"version_price_on_request" boolean DEFAULT false,
  	"version_price_eur" numeric,
  	"version_rent_period" "enum__properties_v_version_rent_period" DEFAULT 'monthly',
  	"version_area_gross" numeric,
  	"version_area_net" numeric,
  	"version_terrace_sqm" numeric,
  	"version_common_area_sqm" numeric,
  	"version_rooms" varchar,
  	"version_bedrooms" numeric,
  	"version_bathrooms" numeric,
  	"version_floor" numeric,
  	"version_listing_type" "enum__properties_v_version_listing_type",
  	"version_status" "listing_status" DEFAULT 'available',
  	"version_building_phase" "enum__properties_v_version_building_phase",
  	"version_mortgage_eligible" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_reference" varchar,
  	"version_area_id" integer,
  	"version_street" varchar,
  	"version_landmark" varchar,
  	"version_location" geometry(Point),
  	"version_agent_id" integer,
  	"version_verified" boolean DEFAULT false,
  	"version_featured" boolean DEFAULT false,
  	"version_owner_name" varchar,
  	"version_owner_phone" varchar,
  	"version_internal_notes" varchar,
  	"version_source_request_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__properties_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__properties_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_properties_v_locales" (
  	"version_title" varchar,
  	"version_description" jsonb,
  	"version_documentation_note" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "project_units_orientation" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_project_units_orientation",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "project_units_features" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_project_units_features",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "project_units_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "project_units_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "project_units" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"unit_code" varchar,
  	"building" varchar,
  	"floor_plan_id" integer,
  	"slug" varchar,
  	"property_type" "enum_project_units_property_type" DEFAULT 'apartment',
  	"price" numeric,
  	"currency" "enum_project_units_currency" DEFAULT 'EUR',
  	"price_on_request" boolean DEFAULT false,
  	"price_eur" numeric,
  	"rent_period" "enum_project_units_rent_period" DEFAULT 'monthly',
  	"area_gross" numeric,
  	"area_net" numeric,
  	"terrace_sqm" numeric,
  	"common_area_sqm" numeric,
  	"rooms" varchar,
  	"bedrooms" numeric,
  	"bathrooms" numeric,
  	"floor" numeric,
  	"listing_type" "enum_project_units_listing_type",
  	"status" "listing_status" DEFAULT 'available',
  	"building_phase" "enum_project_units_building_phase",
  	"mortgage_eligible" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_project_units_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "project_units_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_project_units_v_version_orientation" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__project_units_v_version_orientation",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_project_units_v_version_features" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__project_units_v_version_features",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_project_units_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_project_units_v_version_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_project_units_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_project_id" integer,
  	"version_unit_code" varchar,
  	"version_building" varchar,
  	"version_floor_plan_id" integer,
  	"version_slug" varchar,
  	"version_property_type" "enum__project_units_v_version_property_type" DEFAULT 'apartment',
  	"version_price" numeric,
  	"version_currency" "enum__project_units_v_version_currency" DEFAULT 'EUR',
  	"version_price_on_request" boolean DEFAULT false,
  	"version_price_eur" numeric,
  	"version_rent_period" "enum__project_units_v_version_rent_period" DEFAULT 'monthly',
  	"version_area_gross" numeric,
  	"version_area_net" numeric,
  	"version_terrace_sqm" numeric,
  	"version_common_area_sqm" numeric,
  	"version_rooms" varchar,
  	"version_bedrooms" numeric,
  	"version_bathrooms" numeric,
  	"version_floor" numeric,
  	"version_listing_type" "enum__project_units_v_version_listing_type",
  	"version_status" "listing_status" DEFAULT 'available',
  	"version_building_phase" "enum__project_units_v_version_building_phase",
  	"version_mortgage_eligible" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__project_units_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__project_units_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_project_units_v_locales" (
  	"version_title" varchar,
  	"version_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "projects_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_unit_types_summary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rooms" varchar,
  	"area_from" numeric,
  	"area_to" numeric,
  	"price_from" numeric,
  	"available_count" numeric
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"developer_id" integer,
  	"area_id" integer,
  	"location" geometry(Point),
  	"construction_phase" "enum_projects_construction_phase" DEFAULT 'underConstruction',
  	"completion_date" timestamp(3) with time zone,
  	"site_plan_id" integer,
  	"brochure_id" integer,
  	"featured" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"tagline" varchar,
  	"description" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_unit_types_summary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rooms" varchar,
  	"area_from" numeric,
  	"area_to" numeric,
  	"price_from" numeric,
  	"available_count" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_developer_id" integer,
  	"version_area_id" integer,
  	"version_location" geometry(Point),
  	"version_construction_phase" "enum__projects_v_version_construction_phase" DEFAULT 'underConstruction',
  	"version_completion_date" timestamp(3) with time zone,
  	"version_site_plan_id" integer,
  	"version_brochure_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_tagline" varchar,
  	"version_description" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "companies_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_companies_socials_platform",
  	"url" varchar
  );
  
  CREATE TABLE "companies_certifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"issuer" varchar,
  	"year" numeric,
  	"document_id" integer
  );
  
  CREATE TABLE "companies_certifications_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"logo_id" integer,
  	"cover_image_id" integer,
  	"founded_year" numeric,
  	"website" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"verified_partner" boolean DEFAULT false,
  	"legal_name" varchar,
  	"nipt" varchar,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_companies_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "companies_locales" (
  	"about" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "companies_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"areas_id" integer
  );
  
  CREATE TABLE "_companies_v_version_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__companies_v_version_socials_platform",
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_companies_v_version_certifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"issuer" varchar,
  	"year" numeric,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_companies_v_version_certifications_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_companies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_logo_id" integer,
  	"version_cover_image_id" integer,
  	"version_founded_year" numeric,
  	"version_website" varchar,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_verified_partner" boolean DEFAULT false,
  	"version_legal_name" varchar,
  	"version_nipt" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__companies_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__companies_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_companies_v_locales" (
  	"version_about" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_companies_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"areas_id" integer
  );
  
  CREATE TABLE "areas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"kind" "enum_areas_kind" DEFAULT 'neighbourhood' NOT NULL,
  	"parent_id" integer,
  	"center" geometry(Point),
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "areas_locales" (
  	"description" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"cover_image_id" integer,
  	"category" "enum_articles_category",
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"content_type" "enum_articles_content_type" DEFAULT 'editorial',
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"areas_id" integer,
  	"companies_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_cover_image_id" integer,
  	"version_category" "enum__articles_v_version_category",
  	"version_author_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_content_type" "enum__articles_v_version_content_type" DEFAULT 'editorial',
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__articles_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_articles_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"areas_id" integer,
  	"companies_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "listing_requests_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "listing_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"request_status" "enum_listing_requests_request_status" DEFAULT 'new' NOT NULL,
  	"owner_name" varchar NOT NULL,
  	"owner_phone" varchar NOT NULL,
  	"owner_email" varchar,
  	"city" varchar NOT NULL,
  	"area_name" varchar,
  	"address" varchar,
  	"listing_type" "enum_listing_requests_listing_type" NOT NULL,
  	"property_type" varchar,
  	"rooms" varchar,
  	"area_sqm" numeric,
  	"floor" numeric,
  	"asking_price" numeric,
  	"description" varchar,
  	"has_documentation" boolean,
  	"terms_version" varchar NOT NULL,
  	"terms_accepted_at" timestamp(3) with time zone NOT NULL,
  	"submitted_locale" varchar,
  	"assigned_agent_id" integer,
  	"internal_notes" varchar,
  	"rejection_reason" varchar,
  	"linked_property_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"message" varchar,
  	"source_type" "enum_enquiries_source_type" NOT NULL,
  	"source_id" varchar NOT NULL,
  	"source_title" varchar,
  	"locale" varchar,
  	"handled" boolean DEFAULT false,
  	"assigned_agent_id" integer,
  	"terms_version" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'client' NOT NULL,
  	"phone" varchar,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_locales" (
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
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
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"properties_id" integer,
  	"project_units_id" integer,
  	"projects_id" integer,
  	"companies_id" integer,
  	"areas_id" integer,
  	"articles_id" integer,
  	"listing_requests_id" integer,
  	"enquiries_id" integer,
  	"users_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "properties_orientation" ADD CONSTRAINT "properties_orientation_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_features" ADD CONSTRAINT "properties_features_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_gallery" ADD CONSTRAINT "properties_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_gallery" ADD CONSTRAINT "properties_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_gallery_locales" ADD CONSTRAINT "properties_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_source_request_id_listing_requests_id_fk" FOREIGN KEY ("source_request_id") REFERENCES "public"."listing_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_locales" ADD CONSTRAINT "properties_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_properties_v_version_orientation" ADD CONSTRAINT "_properties_v_version_orientation_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_properties_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_properties_v_version_features" ADD CONSTRAINT "_properties_v_version_features_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_properties_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_properties_v_version_gallery" ADD CONSTRAINT "_properties_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v_version_gallery" ADD CONSTRAINT "_properties_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_properties_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_properties_v_version_gallery_locales" ADD CONSTRAINT "_properties_v_version_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_properties_v_version_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_parent_id_properties_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_version_area_id_areas_id_fk" FOREIGN KEY ("version_area_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_version_agent_id_users_id_fk" FOREIGN KEY ("version_agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_version_source_request_id_listing_requests_id_fk" FOREIGN KEY ("version_source_request_id") REFERENCES "public"."listing_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v_locales" ADD CONSTRAINT "_properties_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_properties_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_units_orientation" ADD CONSTRAINT "project_units_orientation_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_units"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_units_features" ADD CONSTRAINT "project_units_features_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_units"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_units_gallery" ADD CONSTRAINT "project_units_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_units_gallery" ADD CONSTRAINT "project_units_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."project_units"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_units_gallery_locales" ADD CONSTRAINT "project_units_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."project_units_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_units" ADD CONSTRAINT "project_units_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_units" ADD CONSTRAINT "project_units_floor_plan_id_media_id_fk" FOREIGN KEY ("floor_plan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_units_locales" ADD CONSTRAINT "project_units_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."project_units"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_project_units_v_version_orientation" ADD CONSTRAINT "_project_units_v_version_orientation_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_project_units_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_project_units_v_version_features" ADD CONSTRAINT "_project_units_v_version_features_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_project_units_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_project_units_v_version_gallery" ADD CONSTRAINT "_project_units_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_project_units_v_version_gallery" ADD CONSTRAINT "_project_units_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_project_units_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_project_units_v_version_gallery_locales" ADD CONSTRAINT "_project_units_v_version_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_project_units_v_version_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_project_units_v" ADD CONSTRAINT "_project_units_v_parent_id_project_units_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_units"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_project_units_v" ADD CONSTRAINT "_project_units_v_version_project_id_projects_id_fk" FOREIGN KEY ("version_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_project_units_v" ADD CONSTRAINT "_project_units_v_version_floor_plan_id_media_id_fk" FOREIGN KEY ("version_floor_plan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_project_units_v_locales" ADD CONSTRAINT "_project_units_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_project_units_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery_locales" ADD CONSTRAINT "projects_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_unit_types_summary" ADD CONSTRAINT "projects_unit_types_summary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_developer_id_companies_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_site_plan_id_media_id_fk" FOREIGN KEY ("site_plan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_brochure_id_media_id_fk" FOREIGN KEY ("brochure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery_locales" ADD CONSTRAINT "_projects_v_version_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_unit_types_summary" ADD CONSTRAINT "_projects_v_version_unit_types_summary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_developer_id_companies_id_fk" FOREIGN KEY ("version_developer_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_area_id_areas_id_fk" FOREIGN KEY ("version_area_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_site_plan_id_media_id_fk" FOREIGN KEY ("version_site_plan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_brochure_id_media_id_fk" FOREIGN KEY ("version_brochure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies_socials" ADD CONSTRAINT "companies_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies_certifications" ADD CONSTRAINT "companies_certifications_document_id_media_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies_certifications" ADD CONSTRAINT "companies_certifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies_certifications_locales" ADD CONSTRAINT "companies_certifications_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies_certifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies_locales" ADD CONSTRAINT "companies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies_rels" ADD CONSTRAINT "companies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies_rels" ADD CONSTRAINT "companies_rels_areas_fk" FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v_version_socials" ADD CONSTRAINT "_companies_v_version_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_companies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v_version_certifications" ADD CONSTRAINT "_companies_v_version_certifications_document_id_media_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v_version_certifications" ADD CONSTRAINT "_companies_v_version_certifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_companies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v_version_certifications_locales" ADD CONSTRAINT "_companies_v_version_certifications_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_companies_v_version_certifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_parent_id_companies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v_locales" ADD CONSTRAINT "_companies_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_companies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v_rels" ADD CONSTRAINT "_companies_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_companies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v_rels" ADD CONSTRAINT "_companies_v_rels_areas_fk" FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "areas" ADD CONSTRAINT "areas_parent_id_areas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "areas" ADD CONSTRAINT "areas_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "areas_locales" ADD CONSTRAINT "areas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_areas_fk" FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_areas_fk" FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listing_requests_photos" ADD CONSTRAINT "listing_requests_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listing_requests_photos" ADD CONSTRAINT "listing_requests_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listing_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listing_requests" ADD CONSTRAINT "listing_requests_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listing_requests" ADD CONSTRAINT "listing_requests_linked_property_id_properties_id_fk" FOREIGN KEY ("linked_property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_locales" ADD CONSTRAINT "users_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_units_fk" FOREIGN KEY ("project_units_id") REFERENCES "public"."project_units"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_areas_fk" FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listing_requests_fk" FOREIGN KEY ("listing_requests_id") REFERENCES "public"."listing_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_orientation_order_idx" ON "properties_orientation" USING btree ("order");
  CREATE INDEX "properties_orientation_parent_idx" ON "properties_orientation" USING btree ("parent_id");
  CREATE INDEX "properties_features_order_idx" ON "properties_features" USING btree ("order");
  CREATE INDEX "properties_features_parent_idx" ON "properties_features" USING btree ("parent_id");
  CREATE INDEX "properties_gallery_order_idx" ON "properties_gallery" USING btree ("_order");
  CREATE INDEX "properties_gallery_parent_id_idx" ON "properties_gallery" USING btree ("_parent_id");
  CREATE INDEX "properties_gallery_image_idx" ON "properties_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "properties_gallery_locales_locale_parent_id_unique" ON "properties_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "properties_slug_idx" ON "properties" USING btree ("slug");
  CREATE INDEX "properties_price_eur_idx" ON "properties" USING btree ("price_eur");
  CREATE UNIQUE INDEX "properties_reference_idx" ON "properties" USING btree ("reference");
  CREATE INDEX "properties_area_idx" ON "properties" USING btree ("area_id");
  CREATE INDEX "properties_agent_idx" ON "properties" USING btree ("agent_id");
  CREATE INDEX "properties_source_request_idx" ON "properties" USING btree ("source_request_id");
  CREATE INDEX "properties_seo_seo_og_image_idx" ON "properties" USING btree ("seo_og_image_id");
  CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
  CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
  CREATE INDEX "properties__status_idx" ON "properties" USING btree ("_status");
  CREATE UNIQUE INDEX "properties_locales_locale_parent_id_unique" ON "properties_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_properties_v_version_orientation_order_idx" ON "_properties_v_version_orientation" USING btree ("order");
  CREATE INDEX "_properties_v_version_orientation_parent_idx" ON "_properties_v_version_orientation" USING btree ("parent_id");
  CREATE INDEX "_properties_v_version_features_order_idx" ON "_properties_v_version_features" USING btree ("order");
  CREATE INDEX "_properties_v_version_features_parent_idx" ON "_properties_v_version_features" USING btree ("parent_id");
  CREATE INDEX "_properties_v_version_gallery_order_idx" ON "_properties_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_properties_v_version_gallery_parent_id_idx" ON "_properties_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_properties_v_version_gallery_image_idx" ON "_properties_v_version_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "_properties_v_version_gallery_locales_locale_parent_id_uniqu" ON "_properties_v_version_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_properties_v_parent_idx" ON "_properties_v" USING btree ("parent_id");
  CREATE INDEX "_properties_v_version_version_slug_idx" ON "_properties_v" USING btree ("version_slug");
  CREATE INDEX "_properties_v_version_version_price_eur_idx" ON "_properties_v" USING btree ("version_price_eur");
  CREATE INDEX "_properties_v_version_version_reference_idx" ON "_properties_v" USING btree ("version_reference");
  CREATE INDEX "_properties_v_version_version_area_idx" ON "_properties_v" USING btree ("version_area_id");
  CREATE INDEX "_properties_v_version_version_agent_idx" ON "_properties_v" USING btree ("version_agent_id");
  CREATE INDEX "_properties_v_version_version_source_request_idx" ON "_properties_v" USING btree ("version_source_request_id");
  CREATE INDEX "_properties_v_version_seo_version_seo_og_image_idx" ON "_properties_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_properties_v_version_version_updated_at_idx" ON "_properties_v" USING btree ("version_updated_at");
  CREATE INDEX "_properties_v_version_version_created_at_idx" ON "_properties_v" USING btree ("version_created_at");
  CREATE INDEX "_properties_v_version_version__status_idx" ON "_properties_v" USING btree ("version__status");
  CREATE INDEX "_properties_v_created_at_idx" ON "_properties_v" USING btree ("created_at");
  CREATE INDEX "_properties_v_updated_at_idx" ON "_properties_v" USING btree ("updated_at");
  CREATE INDEX "_properties_v_snapshot_idx" ON "_properties_v" USING btree ("snapshot");
  CREATE INDEX "_properties_v_published_locale_idx" ON "_properties_v" USING btree ("published_locale");
  CREATE INDEX "_properties_v_latest_idx" ON "_properties_v" USING btree ("latest");
  CREATE INDEX "_properties_v_autosave_idx" ON "_properties_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_properties_v_locales_locale_parent_id_unique" ON "_properties_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "project_units_orientation_order_idx" ON "project_units_orientation" USING btree ("order");
  CREATE INDEX "project_units_orientation_parent_idx" ON "project_units_orientation" USING btree ("parent_id");
  CREATE INDEX "project_units_features_order_idx" ON "project_units_features" USING btree ("order");
  CREATE INDEX "project_units_features_parent_idx" ON "project_units_features" USING btree ("parent_id");
  CREATE INDEX "project_units_gallery_order_idx" ON "project_units_gallery" USING btree ("_order");
  CREATE INDEX "project_units_gallery_parent_id_idx" ON "project_units_gallery" USING btree ("_parent_id");
  CREATE INDEX "project_units_gallery_image_idx" ON "project_units_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "project_units_gallery_locales_locale_parent_id_unique" ON "project_units_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "project_units_project_idx" ON "project_units" USING btree ("project_id");
  CREATE INDEX "project_units_floor_plan_idx" ON "project_units" USING btree ("floor_plan_id");
  CREATE UNIQUE INDEX "project_units_slug_idx" ON "project_units" USING btree ("slug");
  CREATE INDEX "project_units_price_eur_idx" ON "project_units" USING btree ("price_eur");
  CREATE INDEX "project_units_updated_at_idx" ON "project_units" USING btree ("updated_at");
  CREATE INDEX "project_units_created_at_idx" ON "project_units" USING btree ("created_at");
  CREATE INDEX "project_units__status_idx" ON "project_units" USING btree ("_status");
  CREATE UNIQUE INDEX "project_units_locales_locale_parent_id_unique" ON "project_units_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_project_units_v_version_orientation_order_idx" ON "_project_units_v_version_orientation" USING btree ("order");
  CREATE INDEX "_project_units_v_version_orientation_parent_idx" ON "_project_units_v_version_orientation" USING btree ("parent_id");
  CREATE INDEX "_project_units_v_version_features_order_idx" ON "_project_units_v_version_features" USING btree ("order");
  CREATE INDEX "_project_units_v_version_features_parent_idx" ON "_project_units_v_version_features" USING btree ("parent_id");
  CREATE INDEX "_project_units_v_version_gallery_order_idx" ON "_project_units_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_project_units_v_version_gallery_parent_id_idx" ON "_project_units_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_project_units_v_version_gallery_image_idx" ON "_project_units_v_version_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "_project_units_v_version_gallery_locales_locale_parent_id_un" ON "_project_units_v_version_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_project_units_v_parent_idx" ON "_project_units_v" USING btree ("parent_id");
  CREATE INDEX "_project_units_v_version_version_project_idx" ON "_project_units_v" USING btree ("version_project_id");
  CREATE INDEX "_project_units_v_version_version_floor_plan_idx" ON "_project_units_v" USING btree ("version_floor_plan_id");
  CREATE INDEX "_project_units_v_version_version_slug_idx" ON "_project_units_v" USING btree ("version_slug");
  CREATE INDEX "_project_units_v_version_version_price_eur_idx" ON "_project_units_v" USING btree ("version_price_eur");
  CREATE INDEX "_project_units_v_version_version_updated_at_idx" ON "_project_units_v" USING btree ("version_updated_at");
  CREATE INDEX "_project_units_v_version_version_created_at_idx" ON "_project_units_v" USING btree ("version_created_at");
  CREATE INDEX "_project_units_v_version_version__status_idx" ON "_project_units_v" USING btree ("version__status");
  CREATE INDEX "_project_units_v_created_at_idx" ON "_project_units_v" USING btree ("created_at");
  CREATE INDEX "_project_units_v_updated_at_idx" ON "_project_units_v" USING btree ("updated_at");
  CREATE INDEX "_project_units_v_snapshot_idx" ON "_project_units_v" USING btree ("snapshot");
  CREATE INDEX "_project_units_v_published_locale_idx" ON "_project_units_v" USING btree ("published_locale");
  CREATE INDEX "_project_units_v_latest_idx" ON "_project_units_v" USING btree ("latest");
  CREATE INDEX "_project_units_v_autosave_idx" ON "_project_units_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_project_units_v_locales_locale_parent_id_unique" ON "_project_units_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_gallery_locales_locale_parent_id_unique" ON "projects_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_unit_types_summary_order_idx" ON "projects_unit_types_summary" USING btree ("_order");
  CREATE INDEX "projects_unit_types_summary_parent_id_idx" ON "projects_unit_types_summary" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_developer_idx" ON "projects" USING btree ("developer_id");
  CREATE INDEX "projects_area_idx" ON "projects" USING btree ("area_id");
  CREATE INDEX "projects_site_plan_idx" ON "projects" USING btree ("site_plan_id");
  CREATE INDEX "projects_brochure_idx" ON "projects" USING btree ("brochure_id");
  CREATE INDEX "projects_seo_seo_og_image_idx" ON "projects" USING btree ("seo_og_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "_projects_v_version_gallery_locales_locale_parent_id_unique" ON "_projects_v_version_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_unit_types_summary_order_idx" ON "_projects_v_version_unit_types_summary" USING btree ("_order");
  CREATE INDEX "_projects_v_version_unit_types_summary_parent_id_idx" ON "_projects_v_version_unit_types_summary" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_developer_idx" ON "_projects_v" USING btree ("version_developer_id");
  CREATE INDEX "_projects_v_version_version_area_idx" ON "_projects_v" USING btree ("version_area_id");
  CREATE INDEX "_projects_v_version_version_site_plan_idx" ON "_projects_v" USING btree ("version_site_plan_id");
  CREATE INDEX "_projects_v_version_version_brochure_idx" ON "_projects_v" USING btree ("version_brochure_id");
  CREATE INDEX "_projects_v_version_seo_version_seo_og_image_idx" ON "_projects_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "companies_socials_order_idx" ON "companies_socials" USING btree ("_order");
  CREATE INDEX "companies_socials_parent_id_idx" ON "companies_socials" USING btree ("_parent_id");
  CREATE INDEX "companies_certifications_order_idx" ON "companies_certifications" USING btree ("_order");
  CREATE INDEX "companies_certifications_parent_id_idx" ON "companies_certifications" USING btree ("_parent_id");
  CREATE INDEX "companies_certifications_document_idx" ON "companies_certifications" USING btree ("document_id");
  CREATE UNIQUE INDEX "companies_certifications_locales_locale_parent_id_unique" ON "companies_certifications_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "companies_slug_idx" ON "companies" USING btree ("slug");
  CREATE INDEX "companies_logo_idx" ON "companies" USING btree ("logo_id");
  CREATE INDEX "companies_cover_image_idx" ON "companies" USING btree ("cover_image_id");
  CREATE INDEX "companies_seo_seo_og_image_idx" ON "companies" USING btree ("seo_og_image_id");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE INDEX "companies__status_idx" ON "companies" USING btree ("_status");
  CREATE UNIQUE INDEX "companies_locales_locale_parent_id_unique" ON "companies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "companies_rels_order_idx" ON "companies_rels" USING btree ("order");
  CREATE INDEX "companies_rels_parent_idx" ON "companies_rels" USING btree ("parent_id");
  CREATE INDEX "companies_rels_path_idx" ON "companies_rels" USING btree ("path");
  CREATE INDEX "companies_rels_areas_id_idx" ON "companies_rels" USING btree ("areas_id");
  CREATE INDEX "_companies_v_version_socials_order_idx" ON "_companies_v_version_socials" USING btree ("_order");
  CREATE INDEX "_companies_v_version_socials_parent_id_idx" ON "_companies_v_version_socials" USING btree ("_parent_id");
  CREATE INDEX "_companies_v_version_certifications_order_idx" ON "_companies_v_version_certifications" USING btree ("_order");
  CREATE INDEX "_companies_v_version_certifications_parent_id_idx" ON "_companies_v_version_certifications" USING btree ("_parent_id");
  CREATE INDEX "_companies_v_version_certifications_document_idx" ON "_companies_v_version_certifications" USING btree ("document_id");
  CREATE UNIQUE INDEX "_companies_v_version_certifications_locales_locale_parent_id" ON "_companies_v_version_certifications_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_companies_v_parent_idx" ON "_companies_v" USING btree ("parent_id");
  CREATE INDEX "_companies_v_version_version_slug_idx" ON "_companies_v" USING btree ("version_slug");
  CREATE INDEX "_companies_v_version_version_logo_idx" ON "_companies_v" USING btree ("version_logo_id");
  CREATE INDEX "_companies_v_version_version_cover_image_idx" ON "_companies_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_companies_v_version_seo_version_seo_og_image_idx" ON "_companies_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_companies_v_version_version_updated_at_idx" ON "_companies_v" USING btree ("version_updated_at");
  CREATE INDEX "_companies_v_version_version_created_at_idx" ON "_companies_v" USING btree ("version_created_at");
  CREATE INDEX "_companies_v_version_version__status_idx" ON "_companies_v" USING btree ("version__status");
  CREATE INDEX "_companies_v_created_at_idx" ON "_companies_v" USING btree ("created_at");
  CREATE INDEX "_companies_v_updated_at_idx" ON "_companies_v" USING btree ("updated_at");
  CREATE INDEX "_companies_v_snapshot_idx" ON "_companies_v" USING btree ("snapshot");
  CREATE INDEX "_companies_v_published_locale_idx" ON "_companies_v" USING btree ("published_locale");
  CREATE INDEX "_companies_v_latest_idx" ON "_companies_v" USING btree ("latest");
  CREATE INDEX "_companies_v_autosave_idx" ON "_companies_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_companies_v_locales_locale_parent_id_unique" ON "_companies_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_companies_v_rels_order_idx" ON "_companies_v_rels" USING btree ("order");
  CREATE INDEX "_companies_v_rels_parent_idx" ON "_companies_v_rels" USING btree ("parent_id");
  CREATE INDEX "_companies_v_rels_path_idx" ON "_companies_v_rels" USING btree ("path");
  CREATE INDEX "_companies_v_rels_areas_id_idx" ON "_companies_v_rels" USING btree ("areas_id");
  CREATE UNIQUE INDEX "areas_slug_idx" ON "areas" USING btree ("slug");
  CREATE INDEX "areas_parent_idx" ON "areas" USING btree ("parent_id");
  CREATE INDEX "areas_seo_seo_og_image_idx" ON "areas" USING btree ("seo_og_image_id");
  CREATE INDEX "areas_updated_at_idx" ON "areas" USING btree ("updated_at");
  CREATE INDEX "areas_created_at_idx" ON "areas" USING btree ("created_at");
  CREATE UNIQUE INDEX "areas_locales_locale_parent_id_unique" ON "areas_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_cover_image_idx" ON "articles" USING btree ("cover_image_id");
  CREATE INDEX "articles_author_idx" ON "articles" USING btree ("author_id");
  CREATE INDEX "articles_seo_seo_og_image_idx" ON "articles" USING btree ("seo_og_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_areas_id_idx" ON "articles_rels" USING btree ("areas_id");
  CREATE INDEX "articles_rels_companies_id_idx" ON "articles_rels" USING btree ("companies_id");
  CREATE INDEX "articles_rels_projects_id_idx" ON "articles_rels" USING btree ("projects_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_cover_image_idx" ON "_articles_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_articles_v_version_version_author_idx" ON "_articles_v" USING btree ("version_author_id");
  CREATE INDEX "_articles_v_version_seo_version_seo_og_image_idx" ON "_articles_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_snapshot_idx" ON "_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "_articles_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_articles_v_locales_locale_parent_id_unique" ON "_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_areas_id_idx" ON "_articles_v_rels" USING btree ("areas_id");
  CREATE INDEX "_articles_v_rels_companies_id_idx" ON "_articles_v_rels" USING btree ("companies_id");
  CREATE INDEX "_articles_v_rels_projects_id_idx" ON "_articles_v_rels" USING btree ("projects_id");
  CREATE INDEX "listing_requests_photos_order_idx" ON "listing_requests_photos" USING btree ("_order");
  CREATE INDEX "listing_requests_photos_parent_id_idx" ON "listing_requests_photos" USING btree ("_parent_id");
  CREATE INDEX "listing_requests_photos_image_idx" ON "listing_requests_photos" USING btree ("image_id");
  CREATE INDEX "listing_requests_assigned_agent_idx" ON "listing_requests" USING btree ("assigned_agent_id");
  CREATE INDEX "listing_requests_linked_property_idx" ON "listing_requests" USING btree ("linked_property_id");
  CREATE INDEX "listing_requests_updated_at_idx" ON "listing_requests" USING btree ("updated_at");
  CREATE INDEX "listing_requests_created_at_idx" ON "listing_requests" USING btree ("created_at");
  CREATE INDEX "enquiries_source_id_idx" ON "enquiries" USING btree ("source_id");
  CREATE INDEX "enquiries_assigned_agent_idx" ON "enquiries" USING btree ("assigned_agent_id");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_photo_idx" ON "users" USING btree ("photo_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "users_locales_locale_parent_id_unique" ON "users_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");
  CREATE INDEX "payload_locked_documents_rels_project_units_id_idx" ON "payload_locked_documents_rels" USING btree ("project_units_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX "payload_locked_documents_rels_areas_id_idx" ON "payload_locked_documents_rels" USING btree ("areas_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_listing_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("listing_requests_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "properties_orientation" CASCADE;
  DROP TABLE "properties_features" CASCADE;
  DROP TABLE "properties_gallery" CASCADE;
  DROP TABLE "properties_gallery_locales" CASCADE;
  DROP TABLE "properties" CASCADE;
  DROP TABLE "properties_locales" CASCADE;
  DROP TABLE "_properties_v_version_orientation" CASCADE;
  DROP TABLE "_properties_v_version_features" CASCADE;
  DROP TABLE "_properties_v_version_gallery" CASCADE;
  DROP TABLE "_properties_v_version_gallery_locales" CASCADE;
  DROP TABLE "_properties_v" CASCADE;
  DROP TABLE "_properties_v_locales" CASCADE;
  DROP TABLE "project_units_orientation" CASCADE;
  DROP TABLE "project_units_features" CASCADE;
  DROP TABLE "project_units_gallery" CASCADE;
  DROP TABLE "project_units_gallery_locales" CASCADE;
  DROP TABLE "project_units" CASCADE;
  DROP TABLE "project_units_locales" CASCADE;
  DROP TABLE "_project_units_v_version_orientation" CASCADE;
  DROP TABLE "_project_units_v_version_features" CASCADE;
  DROP TABLE "_project_units_v_version_gallery" CASCADE;
  DROP TABLE "_project_units_v_version_gallery_locales" CASCADE;
  DROP TABLE "_project_units_v" CASCADE;
  DROP TABLE "_project_units_v_locales" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects_gallery_locales" CASCADE;
  DROP TABLE "projects_unit_types_summary" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v_version_gallery_locales" CASCADE;
  DROP TABLE "_projects_v_version_unit_types_summary" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "companies_socials" CASCADE;
  DROP TABLE "companies_certifications" CASCADE;
  DROP TABLE "companies_certifications_locales" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "companies_locales" CASCADE;
  DROP TABLE "companies_rels" CASCADE;
  DROP TABLE "_companies_v_version_socials" CASCADE;
  DROP TABLE "_companies_v_version_certifications" CASCADE;
  DROP TABLE "_companies_v_version_certifications_locales" CASCADE;
  DROP TABLE "_companies_v" CASCADE;
  DROP TABLE "_companies_v_locales" CASCADE;
  DROP TABLE "_companies_v_rels" CASCADE;
  DROP TABLE "areas" CASCADE;
  DROP TABLE "areas_locales" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_locales" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "listing_requests_photos" CASCADE;
  DROP TABLE "listing_requests" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_properties_orientation";
  DROP TYPE "public"."enum_properties_features";
  DROP TYPE "public"."enum_properties_property_type";
  DROP TYPE "public"."enum_properties_currency";
  DROP TYPE "public"."enum_properties_rent_period";
  DROP TYPE "public"."enum_properties_listing_type";
  DROP TYPE "public"."listing_status";
  DROP TYPE "public"."enum_properties_building_phase";
  DROP TYPE "public"."enum_properties_status";
  DROP TYPE "public"."enum__properties_v_version_orientation";
  DROP TYPE "public"."enum__properties_v_version_features";
  DROP TYPE "public"."enum__properties_v_version_property_type";
  DROP TYPE "public"."enum__properties_v_version_currency";
  DROP TYPE "public"."enum__properties_v_version_rent_period";
  DROP TYPE "public"."enum__properties_v_version_listing_type";
  DROP TYPE "public"."enum__properties_v_version_building_phase";
  DROP TYPE "public"."enum__properties_v_version_status";
  DROP TYPE "public"."enum__properties_v_published_locale";
  DROP TYPE "public"."enum_project_units_orientation";
  DROP TYPE "public"."enum_project_units_features";
  DROP TYPE "public"."enum_project_units_property_type";
  DROP TYPE "public"."enum_project_units_currency";
  DROP TYPE "public"."enum_project_units_rent_period";
  DROP TYPE "public"."enum_project_units_listing_type";
  DROP TYPE "public"."enum_project_units_building_phase";
  DROP TYPE "public"."enum_project_units_status";
  DROP TYPE "public"."enum__project_units_v_version_orientation";
  DROP TYPE "public"."enum__project_units_v_version_features";
  DROP TYPE "public"."enum__project_units_v_version_property_type";
  DROP TYPE "public"."enum__project_units_v_version_currency";
  DROP TYPE "public"."enum__project_units_v_version_rent_period";
  DROP TYPE "public"."enum__project_units_v_version_listing_type";
  DROP TYPE "public"."enum__project_units_v_version_building_phase";
  DROP TYPE "public"."enum__project_units_v_version_status";
  DROP TYPE "public"."enum__project_units_v_published_locale";
  DROP TYPE "public"."enum_projects_construction_phase";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_construction_phase";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_companies_socials_platform";
  DROP TYPE "public"."enum_companies_status";
  DROP TYPE "public"."enum__companies_v_version_socials_platform";
  DROP TYPE "public"."enum__companies_v_version_status";
  DROP TYPE "public"."enum__companies_v_published_locale";
  DROP TYPE "public"."enum_areas_kind";
  DROP TYPE "public"."enum_articles_category";
  DROP TYPE "public"."enum_articles_content_type";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_category";
  DROP TYPE "public"."enum__articles_v_version_content_type";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum__articles_v_published_locale";
  DROP TYPE "public"."enum_listing_requests_request_status";
  DROP TYPE "public"."enum_listing_requests_listing_type";
  DROP TYPE "public"."enum_enquiries_source_type";
  DROP TYPE "public"."enum_users_role";`)
}
