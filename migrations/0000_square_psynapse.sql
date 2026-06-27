CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'employee' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"owner_id" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compartments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"machine_id" uuid NOT NULL,
	"compartment_number" integer NOT NULL,
	"width" integer DEFAULT 200 NOT NULL,
	"height" integer DEFAULT 400 NOT NULL,
	"managed_by" text,
	"product_id" uuid,
	"product_name" varchar(100),
	"current_price" numeric(10, 2),
	"currency_symbol" varchar(10),
	"current_quantity" numeric(10, 2),
	"unit_name" varchar(20),
	"discount_value" integer,
	"discount_day" integer,
	"compartment_date_created" timestamp with time zone DEFAULT now(),
	"expiration_date" date,
	"last_updated" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"currency_name" varchar(20) NOT NULL,
	"currency_symbol" varchar(1) NOT NULL,
	CONSTRAINT "currencies_currency_name_unique" UNIQUE("currency_name")
);
--> statement-breakpoint
CREATE TABLE "machine_modes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"machine_mode_name" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "machine_types" (
	"id" uuid PRIMARY KEY NOT NULL,
	"machine_type_name" varchar(50) NOT NULL,
	CONSTRAINT "machine_types_machine_type_name_unique" UNIQUE("machine_type_name")
);
--> statement-breakpoint
CREATE TABLE "machines" (
	"id" uuid PRIMARY KEY NOT NULL,
	"machine_name" varchar(100) NOT NULL,
	"serial_number" varchar(100) NOT NULL,
	"production_year" integer NOT NULL,
	"compartment_count" integer NOT NULL,
	"machine_date_created" timestamp with time zone DEFAULT now(),
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"machine_mode_id" uuid,
	"machine_type_id" uuid NOT NULL,
	"owner_id" text,
	CONSTRAINT "machines_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "pictures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"picture_name" varchar(255) NOT NULL,
	"picture_content" text,
	"picture_date_created" timestamp with time zone DEFAULT now(),
	"picture_owner_id" text
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_name" varchar(100) NOT NULL,
	"default_price" numeric(10, 2) NOT NULL,
	"default_currency_id" uuid NOT NULL,
	"default_quantity" numeric(10, 2) NOT NULL,
	"default_unit_id" uuid NOT NULL,
	"product_date_created" timestamp with time zone DEFAULT now(),
	"owner_id" text NOT NULL,
	"product_picture_id" uuid,
	"product_symbol_id" uuid,
	"discount_value" integer,
	"discount_day" integer,
	"last_updated" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smartfridges" (
	"id" uuid PRIMARY KEY NOT NULL,
	"machine_id" uuid NOT NULL,
	"count" integer,
	"product_name" varchar(100),
	"current_price" numeric(10, 2),
	"currency_symbol" varchar(10),
	"current_quantity" numeric(10, 2),
	"unit_name" varchar(20),
	"expiration_date" date,
	"product_id" uuid
);
--> statement-breakpoint
CREATE TABLE "symbols" (
	"id" uuid PRIMARY KEY NOT NULL,
	"symbol_name" varchar(50) NOT NULL,
	"symbol_picture" text NOT NULL,
	"owner_id" text
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY NOT NULL,
	"unit_name" varchar(20) NOT NULL,
	"unit_symbol" varchar(3) NOT NULL,
	CONSTRAINT "units_unit_name_unique" UNIQUE("unit_name")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compartments" ADD CONSTRAINT "compartments_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machines" ADD CONSTRAINT "machines_machine_mode_id_machine_modes_id_fk" FOREIGN KEY ("machine_mode_id") REFERENCES "public"."machine_modes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machines" ADD CONSTRAINT "machines_machine_type_id_machine_types_id_fk" FOREIGN KEY ("machine_type_id") REFERENCES "public"."machine_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machines" ADD CONSTRAINT "machines_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pictures" ADD CONSTRAINT "pictures_picture_owner_id_user_id_fk" FOREIGN KEY ("picture_owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_default_currency_id_currencies_id_fk" FOREIGN KEY ("default_currency_id") REFERENCES "public"."currencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_default_unit_id_units_id_fk" FOREIGN KEY ("default_unit_id") REFERENCES "public"."units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_picture_id_pictures_id_fk" FOREIGN KEY ("product_picture_id") REFERENCES "public"."pictures"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_symbol_id_symbols_id_fk" FOREIGN KEY ("product_symbol_id") REFERENCES "public"."symbols"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smartfridges" ADD CONSTRAINT "smartfridges_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smartfridges" ADD CONSTRAINT "smartfridges_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symbols" ADD CONSTRAINT "symbols_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_compartments_machine_id" ON "compartments" USING btree ("machine_id");