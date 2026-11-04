ALTER TABLE `albums` ADD `last_played_at` integer;--> statement-breakpoint
ALTER TABLE `albums` ADD `pinned_at` integer;--> statement-breakpoint
ALTER TABLE `artists` ADD `last_played_at` integer;--> statement-breakpoint
ALTER TABLE `artists` ADD `pinned_at` integer;--> statement-breakpoint
ALTER TABLE `playlists` ADD `last_played_at` integer;--> statement-breakpoint
ALTER TABLE `playlists` ADD `pinned_at` integer;--> statement-breakpoint
ALTER TABLE `songs` ADD `last_played_at` integer;--> statement-breakpoint
ALTER TABLE `songs` ADD `pinned_at` integer;