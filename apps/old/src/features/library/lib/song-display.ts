import { SongType } from "@/src/constants/Types";

export const generateSongKey = (song: SongType) => {
  if (song) {
    const name = song.title ?? "no-name";
    const artist = song.artist ?? "no-artist";
    const album = song.album ?? "no-album";
    const uuid = song.uuid ?? "no-uuid";
    let cover = "no-cover";

    try {
      cover = song.artwork ? song.artwork.substring(0, 300) : "no-cover";
    } catch {
      cover = "no-cover";
    }

    return `${song.id}-${uuid}-${name}-${artist}-${album}-${cover}`;
  }

  return "-1";
};
