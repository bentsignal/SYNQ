CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hash` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_hash` ON `images` (`hash`);--> statement-breakpoint
ALTER TABLE `albums` ADD `coverImageId` integer REFERENCES images(id);--> statement-breakpoint
ALTER TABLE `artists` ADD `profileImageId` integer REFERENCES images(id);--> statement-breakpoint
ALTER TABLE `playlists` ADD `coverImageId` integer REFERENCES images(id);--> statement-breakpoint
ALTER TABLE `songs` ADD `coverImageId` integer REFERENCES images(id);