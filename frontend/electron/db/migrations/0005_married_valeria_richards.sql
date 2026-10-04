CREATE TABLE `product_recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`composite_product_id` text NOT NULL,
	`component_product_id` text NOT NULL,
	`quantity` real NOT NULL,
	FOREIGN KEY (`composite_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`component_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_inventory_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity` real NOT NULL,
	`reference_id` text,
	`date` integer NOT NULL,
	`user_id` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_inventory_transactions`("id", "product_id", "type", "quantity", "reference_id", "date", "user_id", "notes") SELECT "id", "product_id", "type", "quantity", "reference_id", "date", "user_id", "notes" FROM `inventory_transactions`;--> statement-breakpoint
DROP TABLE `inventory_transactions`;--> statement-breakpoint
ALTER TABLE `__new_inventory_transactions` RENAME TO `inventory_transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_invoice_items` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_price` real NOT NULL,
	`cost` real DEFAULT 0 NOT NULL,
	`subtotal` real NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_invoice_items`("id", "invoice_id", "product_id", "quantity", "unit_price", "cost", "subtotal") SELECT "id", "invoice_id", "product_id", "quantity", "unit_price", "cost", "subtotal" FROM `invoice_items`;--> statement-breakpoint
DROP TABLE `invoice_items`;--> statement-breakpoint
ALTER TABLE `__new_invoice_items` RENAME TO `invoice_items`;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'STANDARD' NOT NULL,
	`manage_stock` integer DEFAULT true,
	`price` real NOT NULL,
	`cost` real NOT NULL,
	`stock_quantity` real DEFAULT 0,
	`min_stock_alert` real DEFAULT 5,
	`location` text,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "sku", "name", "description", "type", "manage_stock", "price", "cost", "stock_quantity", "min_stock_alert", "location", "is_active") SELECT "id", "sku", "name", "description", 'STANDARD' as "type", 1 as "manage_stock", "price", "cost", "stock_quantity", "min_stock_alert", "location", "is_active" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `__new_quote_items` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_price` real NOT NULL,
	`subtotal` real NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_quote_items`("id", "quote_id", "product_id", "quantity", "unit_price", "subtotal") SELECT "id", "quote_id", "product_id", "quantity", "unit_price", "subtotal" FROM `quote_items`;--> statement-breakpoint
DROP TABLE `quote_items`;--> statement-breakpoint
ALTER TABLE `__new_quote_items` RENAME TO `quote_items`;