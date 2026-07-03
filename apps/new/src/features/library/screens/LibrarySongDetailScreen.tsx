import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { LibraryInvalidSongState } from "../components/LibraryInvalidSongState";
import { LibrarySongDetailView } from "../components/LibrarySongDetailView";
import { useLibrarySongDetailController } from "../hooks/use-library-song-detail-controller";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";

export function LibrarySongDetailScreen() {
  const id = useNumericRouteParam();

  if (id === null) {
    return <LibraryInvalidSongState />;
  }

  return <LibrarySongDetailContent songId={id} />;
}

function LibrarySongDetailContent({ songId }: { songId: number }) {
  const { detail, errors } = useLibrarySongDetailQuery(songId);
  const controller = useLibrarySongDetailController({
    detail,
    songId,
  });

  return (
    <LibrarySongDetailView
      detail={detail}
      errors={errors}
      songId={songId}
      {...controller}
    />
  );
}
