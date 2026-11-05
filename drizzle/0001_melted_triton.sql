ALTER TABLE `inquiries` ADD `email_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `email_attempted_at` text;