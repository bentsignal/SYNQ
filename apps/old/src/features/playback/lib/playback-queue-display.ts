import { PageType, SongType } from "@/src/constants/Types";
import { getLibrarySongById } from "@/src/features/library/repository/library-song-repository";
import { getPlaybackQueue } from "@/src/features/playback/lib/player-queue-actions-service";

export const getPlaybackQueueDisplaySongs = async () => {
  const results: SongType[] = [];
  const queue = await getPlaybackQueue();

  try {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].id !== -1) {
        const result = await getLibrarySongById(queue[i].id, PageType.QUEUE);
        if (!result) {
          continue;
        }
        result.uuid = queue[i].description;
        results.push(result);
      }
    }
  } catch (error) {
    console.log("error loading queue songs to display in list:", error);
  }

  return results;
};
