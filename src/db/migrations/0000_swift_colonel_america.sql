CREATE TABLE `albumSongs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`albumId` integer,
	`songId` integer
);
--> statement-breakpoint
CREATE TABLE `albums` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`year` integer
);
--> statement-breakpoint
CREATE TABLE `artistSongs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artistId` integer,
	`songId` integer
);
--> statement-breakpoint
CREATE TABLE `artistsAlbums` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artistId` integer,
	`albumId` integer
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `playlistSongs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlistId` integer,
	`songId` integer
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `songs` (
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
