ALTER TABLE "symbols" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "symbols" CASCADE;--> statement-breakpoint
--ALTER TABLE "products" DROP CONSTRAINT "products_product_symbol_id_symbols_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "product_symbol_id";
