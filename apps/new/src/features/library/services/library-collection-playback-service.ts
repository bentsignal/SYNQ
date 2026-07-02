import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";

export const getCollectionPlaybackPlan = ({
  playableSongs,
}: {
  playableSongs: LibraryCollectionDetailSong[];
}) => {
  const [firstSong, ...queuedSongs] = playableSongs;

  return {
    canStartPlayback: firstSong !== undefined,
    firstSong: firstSong ?? null,
    queuedSongs,
  };
};

export type CollectionPlaybackPlan = ReturnType<
  typeof getCollectionPlaybackPlan
>;

export type CollectionPlaybackCommandPlan = {
  firstSong: LibraryCollectionDetailSong | null;
  haptic: "error" | "light";
  playerHref: "/player" | null;
  queuedSongs: LibraryCollectionDetailSong[];
};

export const getCollectionPlaybackCommandPlan = ({
  playableSongs,
}: {
  playableSongs: LibraryCollectionDetailSong[];
}): CollectionPlaybackCommandPlan => {
  const playbackPlan = getCollectionPlaybackPlan({ playableSongs });

  if (!playbackPlan.canStartPlayback || !playbackPlan.firstSong) {
    return {
      firstSong: null,
      haptic: "error",
      playerHref: null,
      queuedSongs: [],
    };
  }

  return {
    firstSong: playbackPlan.firstSong,
    haptic: "light",
    playerHref: "/player",
    queuedSongs: playbackPlan.queuedSongs,
  };
};

export const getCollectionQueuePlan = ({
  canQueue,
  playableSongs,
}: {
  canQueue: boolean;
  playableSongs: LibraryCollectionDetailSong[];
}) => ({
  canQueue,
  queuedSongs: canQueue ? playableSongs : [],
});

export type CollectionQueuePlan = ReturnType<typeof getCollectionQueuePlan>;

export type CollectionQueueCommandPlan = {
  haptic: "error" | "light";
  queuedSongs: LibraryCollectionDetailSong[];
};

export const getCollectionQueueCommandPlan = ({
  canQueue,
  playableSongs,
}: {
  canQueue: boolean;
  playableSongs: LibraryCollectionDetailSong[];
}): CollectionQueueCommandPlan => {
  const queuePlan = getCollectionQueuePlan({ canQueue, playableSongs });

  return {
    haptic: queuePlan.canQueue ? "light" : "error",
    queuedSongs: queuePlan.queuedSongs,
  };
};
