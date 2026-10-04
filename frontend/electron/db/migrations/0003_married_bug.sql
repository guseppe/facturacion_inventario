CREATE TABLE `quote_items` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`subtotal` real NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_number` text NOT NULL,
	`date` integer NOT NULL,
	`total_amount` real NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`client_name` text DEFAULT 'Cliente Mostrador',
	`client_address` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_quote_number_unique` ON `quotes` (`quote_number`);