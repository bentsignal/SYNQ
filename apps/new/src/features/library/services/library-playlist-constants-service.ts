export const systemPlaylistId = 1;
export const likedSongsPlaylistId = 2;

export const isProtectedPlaylistId = (playlistId: number) =>
  playlistId === systemPlaylistId || playlistId === likedSongsPlaylistId;
