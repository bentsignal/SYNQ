import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { LibraryInvalidSongState } from "../components/LibraryInvalidSongState";
import { LibrarySongDetailView } from "../components/LibrarySongDetailView";
import { useLibrarySongDetailController } from "../hooks/use-library-song-detail-controller";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";
import { getLibrarySongDetailScreenViewState } from "../services/library-song-detail-state-service";
import { getLibraryInvalidSongState } from "../services/library-song-interaction-service";

export function LibrarySongDetailScreen() {
  const id = useNumericRouteParam();

  if (id === null) {
    return <LibraryInvalidSongState state={getLibraryInvalidSongState()} />;
  }

  return <LibrarySongDetailContent songId={id} />;
}

function LibrarySongDetailContent({ songId }: { songId: number }) {
  const { detail, errors } = useLibrarySongDetailQuery(songId);
  const controller = useLibrarySongDetailController({
    detail,
    songId,
  });
  const viewState = getLibrarySongDetailScreenViewState({
    actionState: controller.actionState,
    detail,
    errors,
    mutationError: controller.error,
    songId,
  });

  return (
    <LibrarySongDetailView
      detail={detail}
      screenViewState={viewState}
      {...controller}
    />
  );
}
