CREATE TABLE `images` (
	`hash` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_hash` ON `images` (`hash`);--> statement-breakpoint
ALTER TABLE `albums` ADD `coverImage` text REFERENCES images(hash);--> statement-breakpoint
ALTER TABLE `artists` ADD `profileImage` text REFERENCES images(hash);--> statement-breakpoint
ALTER TABLE `playlists` ADD `coverImage` text REFERENCES images(hash);--> statement-breakpoint
ALTER TABLE `songs` ADD `pathToFile` text;--> statement-breakpoint
ALTER TABLE `songs` ADD `coverImage` text REFERENCES images(hash);--> statement-breakpoint
ALTER TABLE `songs` DROP COLUMN `fileName`;