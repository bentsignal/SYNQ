ALTER TABLE `songs` ADD `snapshotAtLastExport` text;--> statement-breakpoint
ALTER TABLE `songs` DROP COLUMN `edited`;--> statement-breakpoint
ALTER TABLE `songs` DROP COLUMN `artists`;--> statement-breakpoint
ALTER TABLE `songs` DROP COLUMN `album`;--> statement-breakpoint
ALTER TABLE `songs` DROP COLUMN `genre`;