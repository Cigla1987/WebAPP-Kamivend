CREATE TYPE "public"."smart_fridge_service_type" AS ENUM('recognition', 'layout', 'calibration', 'refill', 'diagnostics');--> statement-breakpoint
CREATE TYPE "public"."smart_fridge_session_status" AS ENUM('open', 'completed', 'aborted', 'failed');--> statement-breakpoint
CREATE TYPE "public"."smart_fridge_shopping_status" AS ENUM('authorized', 'live', 'finalizing', 'awaiting_payment', 'paid', 'aborted', 'error');--> statement-breakpoint
CREATE TABLE "smart_fridge_baseline_commits" (
	"id" uuid PRIMARY KEY NOT NULL,
	"shopping_session_id" uuid,
	"shelf_id" uuid NOT NULL,
	"protocol_session_id" integer NOT NULL,
	"final_sequence" integer NOT NULL,
	"commit_token" bigint NOT NULL,
	"action" integer NOT NULL,
	"result" integer,
	"previous_baseline_dg" integer,
	"committed_baseline_dg" integer,
	"requested_at" timestamp with time zone DEFAULT now(),
	"acknowledged_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_calibration_captures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"calibration_run_id" uuid NOT NULL,
	"capture_id" integer NOT NULL,
	"position" varchar(40) NOT NULL,
	"known_weight_dg" integer DEFAULT 0 NOT NULL,
	"raw_cell_1" integer NOT NULL,
	"raw_cell_2" integer NOT NULL,
	"raw_cell_3" integer NOT NULL,
	"raw_cell_4" integer NOT NULL,
	"sample_count" integer NOT NULL,
	"stable" boolean NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_calibration_model_cells" (
	"id" uuid PRIMARY KEY NOT NULL,
	"calibration_run_id" uuid NOT NULL,
	"cell_number" integer NOT NULL,
	"zero_raw" integer NOT NULL,
	"gain_q8_24" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_calibration_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"shelf_id" uuid NOT NULL,
	"service_session_id" uuid,
	"cal_session_id" integer NOT NULL,
	"status" varchar(40) DEFAULT 'started' NOT NULL,
	"known_weight_dg" integer,
	"algorithm" varchar(30) DEFAULT 'qr' NOT NULL,
	"rms_residual_dg" integer,
	"maximum_residual_dg" integer,
	"condition_number" numeric(18, 6),
	"validation_passed" boolean DEFAULT false NOT NULL,
	"save_token" bigint,
	"model_schema_version" integer,
	"model_generation" integer,
	"crc_valid" boolean,
	"started_by" text,
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"failure_reason" text
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_edge_devices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"smart_fridge_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"device_key" varchar(120) NOT NULL,
	"display_name" varchar(120),
	"enabled" boolean DEFAULT true NOT NULL,
	"last_cursor" bigint DEFAULT 0 NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_layout_slots" (
	"id" uuid PRIMARY KEY NOT NULL,
	"layout_id" uuid NOT NULL,
	"shelf_id" uuid NOT NULL,
	"row_number" integer NOT NULL,
	"column_number" integer NOT NULL,
	"width_units" integer DEFAULT 1 NOT NULL,
	"height_units" integer DEFAULT 1 NOT NULL,
	"label" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_layouts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"smart_fridge_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(100) DEFAULT 'Main layout' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"machine_id" uuid NOT NULL,
	"fridge_code" varchar(100),
	"expected_shelf_count" integer DEFAULT 0 NOT NULL,
	"can_bitrate" integer DEFAULT 250000 NOT NULL,
	"protocol_major" integer DEFAULT 1 NOT NULL,
	"protocol_minor" integer DEFAULT 3 NOT NULL,
	"timezone" varchar(100) DEFAULT 'Europe/Zagreb' NOT NULL,
	"currency_id" uuid,
	"setup_completed" boolean DEFAULT false NOT NULL,
	"customer_operation_enabled" boolean DEFAULT false NOT NULL,
	"last_online_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_protocol_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"shopping_session_id" uuid,
	"shelf_id" uuid NOT NULL,
	"protocol_session_id" integer NOT NULL,
	"message_class" integer NOT NULL,
	"sequence_number" integer NOT NULL,
	"event_type" integer,
	"quality" integer,
	"delta_weight_dg" integer,
	"raw_meta" integer,
	"raw_flags" integer,
	"acknowledgement_result" integer,
	"received_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_service_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"smart_fridge_id" uuid NOT NULL,
	"protocol_session_id" integer,
	"service_type" "smart_fridge_service_type" NOT NULL,
	"status" "smart_fridge_session_status" DEFAULT 'open' NOT NULL,
	"opened_by" text,
	"opened_at" timestamp with time zone DEFAULT now(),
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_shelf_states" (
	"id" uuid PRIMARY KEY NOT NULL,
	"shopping_session_id" uuid NOT NULL,
	"shelf_id" uuid NOT NULL,
	"latest_event_sequence" integer,
	"latest_final_sequence" integer,
	"delta_weight_dg" integer DEFAULT 0 NOT NULL,
	"event_type" integer DEFAULT 0 NOT NULL,
	"quality" integer DEFAULT 3 NOT NULL,
	"mode" integer DEFAULT 0 NOT NULL,
	"stable" boolean DEFAULT false NOT NULL,
	"protocol_flags" integer DEFAULT 0 NOT NULL,
	"assigned_product_id" uuid,
	"matched_product_id" uuid,
	"matched_quantity" integer,
	"match_result" varchar(40),
	"final_state_received" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_shopping_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"smart_fridge_id" uuid NOT NULL,
	"protocol_session_id" integer NOT NULL,
	"status" "smart_fridge_shopping_status" NOT NULL,
	"authorization_reference" varchar(200),
	"payment_reference" varchar(200),
	"total_amount" numeric(12, 2),
	"currency_id" uuid,
	"door_opened_at" timestamp with time zone,
	"door_closed_at" timestamp with time zone,
	"final_verification_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"aborted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_sync_outbox" (
	"id" uuid PRIMARY KEY NOT NULL,
	"smart_fridge_id" uuid NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"operation" varchar(20) NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "smart_shelf_nodes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"smart_fridge_id" uuid NOT NULL,
	"device_uid" bigint NOT NULL,
	"current_can_address" integer NOT NULL,
	"address_valid" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"required_for_operation" boolean DEFAULT true NOT NULL,
	"protocol_major" integer,
	"protocol_minor" integer,
	"firmware_major" integer,
	"firmware_minor" integer,
	"capability_flags" integer DEFAULT 0 NOT NULL,
	"sample_rate_code" integer,
	"calibration_valid" boolean DEFAULT false NOT NULL,
	"baseline_valid" boolean DEFAULT false NOT NULL,
	"current_weight_valid" boolean DEFAULT false NOT NULL,
	"current_total_weight_dg" integer,
	"stored_baseline_weight_dg" integer,
	"ready_mask" integer DEFAULT 0 NOT NULL,
	"fault_mask" integer DEFAULT 0 NOT NULL,
	"current_fault_code" integer DEFAULT 0 NOT NULL,
	"current_mode" integer DEFAULT 0 NOT NULL,
	"current_session_id" integer,
	"display_name" varchar(100),
	"last_heartbeat_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_shelf_product_assignments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"shelf_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"price" numeric(10, 2),
	"currency_id" uuid,
	"unit_weight_dg_override" integer,
	"tolerance_dg_override" integer,
	"target_quantity" integer,
	"estimated_quantity" integer,
	"active_from" timestamp with time zone DEFAULT now(),
	"active_until" timestamp with time zone,
	"assigned_by" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_product_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" varchar(100),
	"barcode" varchar(100),
	"nominal_weight_dg" integer NOT NULL,
	"matching_tolerance_dg" integer NOT NULL,
	"maximum_multiple" integer DEFAULT 20 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "machine_claim_codes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"machine_id" uuid NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"used_by" text,
	"used_organization_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_service_credentials" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(30) NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pin_verifier" varchar(128) NOT NULL,
	"pin_salt" varchar(64) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"offline_authorized_until" timestamp with time zone NOT NULL,
	"authorization_version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_device_credentials" (
	"id" uuid PRIMARY KEY NOT NULL,
	"smart_fridge_id" uuid NOT NULL,
	"device_name" varchar(120),
	"credential_hash" varchar(64) NOT NULL,
	"credential_prefix" varchar(16) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"paired_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	"last_heartbeat_at" timestamp with time zone,
	"app_version" varchar(40),
	"database_schema_version" varchar(40),
	"protocol_major" integer,
	"protocol_minor" integer,
	"can_status" varchar(40),
	"detected_shelf_count" integer,
	"pending_sync_count" integer,
	"credential_rotated_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_pairing_codes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"smart_fridge_id" uuid NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_pull_changes" (
	"cursor" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "smart_fridge_pull_changes_cursor_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"smart_fridge_id" uuid NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(120) NOT NULL,
	"operation" varchar(20) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smart_fridge_push_receipts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"edge_device_id" uuid NOT NULL,
	"smart_fridge_id" uuid NOT NULL,
	"event_id" varchar(120) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(120) NOT NULL,
	"operation" varchar(20) NOT NULL,
	"payload" jsonb,
	"accepted" boolean NOT NULL,
	"rejection_reason" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "machines" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "smart_fridge_baseline_commits" ADD CONSTRAINT "smart_fridge_baseline_commits_shopping_session_id_smart_fridge_shopping_sessions_id_fk" FOREIGN KEY ("shopping_session_id") REFERENCES "public"."smart_fridge_shopping_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_baseline_commits" ADD CONSTRAINT "smart_fridge_baseline_commits_shelf_id_smart_shelf_nodes_id_fk" FOREIGN KEY ("shelf_id") REFERENCES "public"."smart_shelf_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_calibration_captures" ADD CONSTRAINT "smart_fridge_calibration_captures_calibration_run_id_smart_fridge_calibration_runs_id_fk" FOREIGN KEY ("calibration_run_id") REFERENCES "public"."smart_fridge_calibration_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_calibration_model_cells" ADD CONSTRAINT "smart_fridge_calibration_model_cells_calibration_run_id_smart_fridge_calibration_runs_id_fk" FOREIGN KEY ("calibration_run_id") REFERENCES "public"."smart_fridge_calibration_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_calibration_runs" ADD CONSTRAINT "smart_fridge_calibration_runs_shelf_id_smart_shelf_nodes_id_fk" FOREIGN KEY ("shelf_id") REFERENCES "public"."smart_shelf_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_calibration_runs" ADD CONSTRAINT "smart_fridge_calibration_runs_service_session_id_smart_fridge_service_sessions_id_fk" FOREIGN KEY ("service_session_id") REFERENCES "public"."smart_fridge_service_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_calibration_runs" ADD CONSTRAINT "smart_fridge_calibration_runs_started_by_user_id_fk" FOREIGN KEY ("started_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_edge_devices" ADD CONSTRAINT "smart_fridge_edge_devices_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_edge_devices" ADD CONSTRAINT "smart_fridge_edge_devices_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_layout_slots" ADD CONSTRAINT "smart_fridge_layout_slots_layout_id_smart_fridge_layouts_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."smart_fridge_layouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_layout_slots" ADD CONSTRAINT "smart_fridge_layout_slots_shelf_id_smart_shelf_nodes_id_fk" FOREIGN KEY ("shelf_id") REFERENCES "public"."smart_shelf_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_layouts" ADD CONSTRAINT "smart_fridge_layouts_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_layouts" ADD CONSTRAINT "smart_fridge_layouts_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_profiles" ADD CONSTRAINT "smart_fridge_profiles_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_profiles" ADD CONSTRAINT "smart_fridge_profiles_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_protocol_events" ADD CONSTRAINT "smart_fridge_protocol_events_shopping_session_id_smart_fridge_shopping_sessions_id_fk" FOREIGN KEY ("shopping_session_id") REFERENCES "public"."smart_fridge_shopping_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_protocol_events" ADD CONSTRAINT "smart_fridge_protocol_events_shelf_id_smart_shelf_nodes_id_fk" FOREIGN KEY ("shelf_id") REFERENCES "public"."smart_shelf_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_service_sessions" ADD CONSTRAINT "smart_fridge_service_sessions_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_service_sessions" ADD CONSTRAINT "smart_fridge_service_sessions_opened_by_user_id_fk" FOREIGN KEY ("opened_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_shelf_states" ADD CONSTRAINT "smart_fridge_shelf_states_shopping_session_id_smart_fridge_shopping_sessions_id_fk" FOREIGN KEY ("shopping_session_id") REFERENCES "public"."smart_fridge_shopping_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_shelf_states" ADD CONSTRAINT "smart_fridge_shelf_states_shelf_id_smart_shelf_nodes_id_fk" FOREIGN KEY ("shelf_id") REFERENCES "public"."smart_shelf_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_shelf_states" ADD CONSTRAINT "smart_fridge_shelf_states_assigned_product_id_products_id_fk" FOREIGN KEY ("assigned_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_shelf_states" ADD CONSTRAINT "smart_fridge_shelf_states_matched_product_id_products_id_fk" FOREIGN KEY ("matched_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_shopping_sessions" ADD CONSTRAINT "smart_fridge_shopping_sessions_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_shopping_sessions" ADD CONSTRAINT "smart_fridge_shopping_sessions_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_sync_outbox" ADD CONSTRAINT "smart_fridge_sync_outbox_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_shelf_nodes" ADD CONSTRAINT "smart_shelf_nodes_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_shelf_product_assignments" ADD CONSTRAINT "smart_shelf_product_assignments_shelf_id_smart_shelf_nodes_id_fk" FOREIGN KEY ("shelf_id") REFERENCES "public"."smart_shelf_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_shelf_product_assignments" ADD CONSTRAINT "smart_shelf_product_assignments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_shelf_product_assignments" ADD CONSTRAINT "smart_shelf_product_assignments_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_shelf_product_assignments" ADD CONSTRAINT "smart_shelf_product_assignments_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_product_profiles" ADD CONSTRAINT "smart_fridge_product_profiles_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_claim_codes" ADD CONSTRAINT "machine_claim_codes_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_claim_codes" ADD CONSTRAINT "machine_claim_codes_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_claim_codes" ADD CONSTRAINT "machine_claim_codes_used_by_user_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_claim_codes" ADD CONSTRAINT "machine_claim_codes_used_organization_id_organization_id_fk" FOREIGN KEY ("used_organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_service_credentials" ADD CONSTRAINT "organization_service_credentials_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_service_credentials" ADD CONSTRAINT "organization_service_credentials_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_device_credentials" ADD CONSTRAINT "smart_fridge_device_credentials_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_pairing_codes" ADD CONSTRAINT "smart_fridge_pairing_codes_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_pairing_codes" ADD CONSTRAINT "smart_fridge_pairing_codes_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_pull_changes" ADD CONSTRAINT "smart_fridge_pull_changes_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_push_receipts" ADD CONSTRAINT "smart_fridge_push_receipts_edge_device_id_smart_fridge_device_credentials_id_fk" FOREIGN KEY ("edge_device_id") REFERENCES "public"."smart_fridge_device_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_fridge_push_receipts" ADD CONSTRAINT "smart_fridge_push_receipts_smart_fridge_id_smart_fridge_profiles_id_fk" FOREIGN KEY ("smart_fridge_id") REFERENCES "public"."smart_fridge_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_commit_token" ON "smart_fridge_baseline_commits" USING btree ("shelf_id","commit_token");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_calibration_capture" ON "smart_fridge_calibration_captures" USING btree ("calibration_run_id","capture_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_calibration_model_cell" ON "smart_fridge_calibration_model_cells" USING btree ("calibration_run_id","cell_number");--> statement-breakpoint
CREATE INDEX "idx_smart_calibration_shelf" ON "smart_fridge_calibration_runs" USING btree ("shelf_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_edge_device_key" ON "smart_fridge_edge_devices" USING btree ("device_key");--> statement-breakpoint
CREATE INDEX "idx_smart_edge_fridge" ON "smart_fridge_edge_devices" USING btree ("smart_fridge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_layout_position" ON "smart_fridge_layout_slots" USING btree ("layout_id","row_number","column_number");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_layout_shelf" ON "smart_fridge_layout_slots" USING btree ("layout_id","shelf_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_fridge_layout_version" ON "smart_fridge_layouts" USING btree ("smart_fridge_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_fridge_profile_machine" ON "smart_fridge_profiles" USING btree ("machine_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_protocol_event_dedupe" ON "smart_fridge_protocol_events" USING btree ("shelf_id","protocol_session_id","message_class","sequence_number");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_session_shelf_state" ON "smart_fridge_shelf_states" USING btree ("shopping_session_id","shelf_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_shopping_protocol_session" ON "smart_fridge_shopping_sessions" USING btree ("smart_fridge_id","protocol_session_id");--> statement-breakpoint
CREATE INDEX "idx_smart_sync_pending" ON "smart_fridge_sync_outbox" USING btree ("smart_fridge_id","synced_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_shelf_fridge_uid" ON "smart_shelf_nodes" USING btree ("smart_fridge_id","device_uid");--> statement-breakpoint
CREATE INDEX "idx_smart_shelf_fridge_address" ON "smart_shelf_nodes" USING btree ("smart_fridge_id","current_can_address");--> statement-breakpoint
CREATE INDEX "idx_smart_shelf_last_seen" ON "smart_shelf_nodes" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "idx_smart_assignment_shelf" ON "smart_shelf_product_assignments" USING btree ("shelf_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_fridge_product_profile_product" ON "smart_fridge_product_profiles" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_smart_fridge_product_profile_enabled" ON "smart_fridge_product_profiles" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "idx_smart_fridge_product_profile_sku" ON "smart_fridge_product_profiles" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_smart_fridge_product_profile_barcode" ON "smart_fridge_product_profiles" USING btree ("barcode");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_machine_claim_code_hash" ON "machine_claim_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "idx_machine_claim_code_machine" ON "machine_claim_codes" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "idx_machine_claim_code_expiry" ON "machine_claim_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_org_service_user" ON "organization_service_credentials" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_org_service_updated" ON "organization_service_credentials" USING btree ("organization_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_device_credential_hash" ON "smart_fridge_device_credentials" USING btree ("credential_hash");--> statement-breakpoint
CREATE INDEX "idx_smart_device_fridge" ON "smart_fridge_device_credentials" USING btree ("smart_fridge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_pairing_code_hash" ON "smart_fridge_pairing_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "idx_smart_pairing_code_fridge" ON "smart_fridge_pairing_codes" USING btree ("smart_fridge_id");--> statement-breakpoint
CREATE INDEX "idx_smart_pull_fridge_cursor" ON "smart_fridge_pull_changes" USING btree ("smart_fridge_id","cursor");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_smart_push_event" ON "smart_fridge_push_receipts" USING btree ("edge_device_id","event_id");