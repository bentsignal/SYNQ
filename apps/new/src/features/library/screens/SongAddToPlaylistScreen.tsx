import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { LibraryInvalidSongState } from "../components/LibraryInvalidSongState";
import { SongAddToPlaylistView } from "../components/SongAddToPlaylistView";
import { useSongAddToPlaylistController } from "../hooks/use-song-add-to-playlist-controller";

export function SongAddToPlaylistScreen() {
  const id = useNumericRouteParam();

  if (id === null) {
    return <LibraryInvalidSongState />;
  }

  return <SongAddToPlaylistContent songId={id} />;
}

function SongAddToPlaylistContent({ songId }: { songId: number }) {
  const controller = useSongAddToPlaylistController({ songId });

  return <SongAddToPlaylistView {...controller} />;
}
