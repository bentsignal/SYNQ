import { SongType } from "@/src/constants/Types";

export const getSongByResult = (result: any): SongType => {
  try {
    return {
      fileName: result.fileName,
      id: result.id,
      edited: result.edited ? true : false,
      fileType: result.fileType,
      format: "id3v2.4",
      title: result.title,
      album: result.album,
      artist: result.artists,
      duration: result.duration,
    };
  } catch {
    return {
      id: -1,
      edited: false,
    };
  }
};
