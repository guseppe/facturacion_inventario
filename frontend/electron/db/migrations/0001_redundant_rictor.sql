ALTER TABLE `invoices` ADD `client_name` text DEFAULT 'Cliente Mostrador';--> statement-breakpoint
ALTER TABLE `invoices` ADD `client_address` text;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `address` text;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `bank_name` text;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `bank_account` text;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `owner_name` text;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `owner_id` text;