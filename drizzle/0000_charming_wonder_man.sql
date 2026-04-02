CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_provider_account_idx` ON `account` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE TABLE `calendar_day` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ad_date` text NOT NULL,
	`bs_date` text NOT NULL,
	`bs_year` integer NOT NULL,
	`bs_month` integer NOT NULL,
	`bs_day` integer NOT NULL,
	`bs_month_name_ne` text NOT NULL,
	`bs_month_name_en` text NOT NULL,
	`weekday_index` integer NOT NULL,
	`weekday_name_ne` text NOT NULL,
	`weekday_name_en` text NOT NULL,
	`tithi` text,
	`paksha` text,
	`lunar_month_ne` text,
	`lunar_month_en` text,
	`nakshatra` text,
	`yoga` text,
	`karana` text,
	`sunrise` text,
	`sunset` text,
	`moonrise` text,
	`moonset` text,
	`is_weekend` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `calendar_day_ad_date_idx` ON `calendar_day` (`ad_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `calendar_day_bs_date_idx` ON `calendar_day` (`bs_date`);--> statement-breakpoint
CREATE TABLE `calendar_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_id` integer NOT NULL,
	`title_ne` text NOT NULL,
	`title_en` text,
	`event_type` text DEFAULT 'festival' NOT NULL,
	`is_public_holiday` integer DEFAULT false NOT NULL,
	`is_optional_holiday` integer DEFAULT false NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `calendar_day`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `calendar_event_day_type_title_idx` ON `calendar_event` (`day_id`,`event_type`,`title_ne`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_idx` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verification_identifier_value_idx` ON `verification` (`identifier`,`value`);