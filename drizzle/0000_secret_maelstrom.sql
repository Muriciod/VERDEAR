CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`name` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`phone` text NOT NULL,
	`space` text NOT NULL,
	`interest` text DEFAULT '' NOT NULL,
	`message` text NOT NULL,
	`diagnostic` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`consent_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_request_key_unique` ON `inquiries` (`request_key`);--> statement-breakpoint
CREATE INDEX `inquiries_created_idx` ON `inquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `inquiries_status_idx` ON `inquiries` (`status`);--> statement-breakpoint
CREATE TABLE `submission_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `submission_limits_expiry_idx` ON `submission_limits` (`expires_at`);