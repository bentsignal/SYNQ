CREATE TABLE IF NOT EXISTS `albumSongs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`albumId` integer,
	`songId` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `albums` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`year` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `artistSongs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artistId` integer,
	`songId` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `artistsAlbums` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artistId` integer,
	`albumId` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `artists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `playlistSongs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlistId` integer,
	`songId` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`edited` integer DEFAULT false,
	`artists` text,
	`album` text,
	`genre` text,
	`duration` integer,
	`fileType` text,
	`fileName` text
);
--> statement-breakpoint
insert into playlists (name) SELECT 'Library' WHERE NOT EXISTS (SELECT 1 FROM playlists WHERE id = 1);
--> statement-breakpoint
insert into playlists (name) SELECT 'Liked Songs' WHERE NOT EXISTS (SELECT 1 FROM playlists WHERE id = 2);
