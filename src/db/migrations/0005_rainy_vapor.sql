PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_albums` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`year` integer,
	`coverImageHash` text,
	FOREIGN KEY (`coverImageHash`) REFERENCES `images`(`hash`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_albums`("id", "name", "year", "coverImageHash") SELECT "id", "name", "year", "coverImageHash" FROM `albums`;--> statement-breakpoint
DROP TABLE `albums`;--> statement-breakpoint
ALTER TABLE `__new_albums` RENAME TO `albums`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_artists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`profileImageHash` text,
	FOREIGN KEY (`profileImageHash`) REFERENCES `images`(`hash`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_artists`("id", "name", "profileImageHash") SELECT "id", "name", "profileImageHash" FROM `artists`;--> statement-breakpoint
DROP TABLE `artists`;--> statement-breakpoint
ALTER TABLE `__new_artists` RENAME TO `artists`;--> statement-breakpoint
CREATE TABLE `__new_playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`coverImageHash` text,
	FOREIGN KEY (`coverImageHash`) REFERENCES `images`(`hash`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_playlists`("id", "name", "coverImageHash") SELECT "id", "name", "coverImageHash" FROM `playlists`;--> statement-breakpoint
DROP TABLE `playlists`;--> statement-breakpoint
ALTER TABLE `__new_playlists` RENAME TO `playlists`;--> statement-breakpoint
CREATE TABLE `__new_songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`snapshotAtLastExport` text,
	`duration` integer,
	`fileType` text,
	`pathToFile` text,
	`coverImageHash` text,
	FOREIGN KEY (`coverImageHash`) REFERENCES `images`(`hash`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_songs`("id", "title", "snapshotAtLastExport", "duration", "fileType", "pathToFile", "coverImageHash") SELECT "id", "title", "snapshotAtLastExport", "duration", "fileType", "pathToFile", "coverImageHash" FROM `songs`;--> statement-breakpoint
DROP TABLE `songs`;--> statement-breakpoint
ALTER TABLE `__new_songs` RENAME TO `songs`;--> statement-breakpoint
CREATE TABLE `__new_images` (
	`hash` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_images`("hash") SELECT "hash" FROM `images`;--> statement-breakpoint
DROP TABLE `images`;--> statement-breakpoint
ALTER TABLE `__new_images` RENAME TO `images`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_hash` ON `images` (`hash`);