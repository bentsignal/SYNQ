ALTER TABLE `artistSongs` ADD `position` integer;--> statement-breakpoint
UPDATE `artistSongs` SET `position` = `id` WHERE `position` IS NULL;--> statement-breakpoint
ALTER TABLE `playlistSongs` ADD `position` integer;--> statement-breakpoint
UPDATE `playlistSongs` SET `position` = `id` WHERE `position` IS NULL;
