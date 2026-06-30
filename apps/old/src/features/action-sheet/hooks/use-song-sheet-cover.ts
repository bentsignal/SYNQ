import { useCallback, useEffect, useState } from "react";
import { SongType } from "@/src/constants/Types";
import { getLibrarySongCoverPath } from "@/src/features/library/repository/library-song-repository";

export function useSongSheetCover(song: SongType) {
  const [coverImage, setCoverImage] = useState("");
  const [emptyCover, setEmptyCover] = useState(false);

  const loadCover = useCallback(async () => {
    try {
      if (song.artwork) {
        setCoverImage(song.artwork);
        setEmptyCover(false);
        return;
      }

      const cover = await getLibrarySongCoverPath(song.id);
      setCoverImage(cover ?? "");
      setEmptyCover(!cover);
    } catch (error) {
      console.log("error loading song cover:", error);
    }
  }, [song]);

  useEffect(() => {
    loadCover();
  }, [loadCover]);

  return {
    coverImage,
    emptyCover,
  };
}
