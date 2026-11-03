CREATE TABLE `album_artists` (
	`album_id` integer NOT NULL,
	`artist_id` integer NOT NULL,
	`position` integer NOT NULL,
	PRIMARY KEY(`album_id`, `artist_id`),
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `album_artists_artist_idx` ON `album_artists` (`artist_id`);--> statement-breakpoint
CREATE TABLE `album_songs` (
	`album_id` integer NOT NULL,
	`song_id` integer NOT NULL,
	`track` integer,
	`position` integer NOT NULL,
	PRIMARY KEY(`album_id`, `song_id`),
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `album_songs_song_idx` ON `album_songs` (`song_id`,`position`);--> statement-breakpoint
CREATE TABLE `albums` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`year` integer,
	`artwork_version` integer,
	`added_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `albums_name_idx` ON `albums` ("name" COLLATE NOCASE);--> statement-breakpoint
CREATE TABLE `artists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`artwork_version` integer,
	`added_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `artists_name_idx` ON `artists` ("name" COLLATE NOCASE);--> statement-breakpoint
CREATE TABLE `legacy_import` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`imported_at` integer NOT NULL,
	`legacy_db_version` integer,
	`counts` text NOT NULL,
	`settings` text,
	`warnings` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlist_songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` integer NOT NULL,
	`song_id` integer NOT NULL,
	`position` real NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `playlist_songs_song_unique` ON `playlist_songs` (`playlist_id`,`song_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `playlist_songs_position_unique` ON `playlist_songs` (`playlist_id`,`position`);--> statement-breakpoint
CREATE INDEX `playlist_songs_song_idx` ON `playlist_songs` (`song_id`);--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`kind` text DEFAULT 'user' NOT NULL,
	`artwork_version` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "playlists_kind_check" CHECK("playlists"."kind" IN ('liked', 'user'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `playlists_one_liked_idx` ON `playlists` (`kind`) WHERE "playlists"."kind" = 'liked';--> statement-breakpoint
CREATE INDEX `playlists_name_idx` ON `playlists` ("name" COLLATE NOCASE);--> statement-breakpoint
CREATE TABLE `song_artists` (
	`song_id` integer NOT NULL,
	`artist_id` integer NOT NULL,
	`position` integer NOT NULL,
	PRIMARY KEY(`song_id`, `artist_id`),
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `song_artists_artist_idx` ON `song_artists` (`artist_id`);--> statement-breakpoint
CREATE TABLE `songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`file_path` text,
	`mime_type` text,
	`duration_ms` integer DEFAULT 0 NOT NULL,
	`artwork_version` integer,
	`added_at` integer NOT NULL,
	`modified_since_export` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `songs_added_at_idx` ON `songs` (`added_at`);