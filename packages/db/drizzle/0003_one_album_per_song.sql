-- A song is on one album (docs/rewrite.md → One album per song). Each song on
-- several keeps the first, by position, whose album has a cover, so its artwork
-- doesn't change, else the first: the rule in src/library/one-album.ts. Albums
-- left without songs stay, as every other write leaves them.
DELETE FROM `album_songs` WHERE `rowid` NOT IN (
  SELECT `kept` FROM (
    SELECT
      `album_songs`.`rowid` AS `kept`,
      ROW_NUMBER() OVER (
        PARTITION BY `album_songs`.`song_id`
        ORDER BY `albums`.`artwork_version` IS NULL, `album_songs`.`position`, `album_songs`.`rowid`
      ) AS `rank`
    FROM `album_songs`
    JOIN `albums` ON `albums`.`id` = `album_songs`.`album_id`
  ) WHERE `rank` = 1
);--> statement-breakpoint
UPDATE `album_songs` SET `position` = 0 WHERE `position` <> 0;--> statement-breakpoint
DROP INDEX `album_songs_song_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `album_songs_song_idx` ON `album_songs` (`song_id`);
