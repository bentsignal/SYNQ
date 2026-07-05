import { Link } from "expo-router";
import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailController } from "../hooks/use-library-song-detail-controller";
import type { LibrarySongDetail } from "../services/library-song-detail-service";
import type { LibrarySongDetailScreenViewState } from "../services/library-song-detail-state-service";
import { LibrarySongDetailActions } from "./LibrarySongDetailActions";
import { LibrarySongDetailHeader } from "./LibrarySongDetailHeader";
import {
  LibrarySongSourcePanel,
  LibrarySongStatusPanel,
} from "./LibrarySongDetailPanels";
import { LibrarySongRelationshipSection } from "./LibrarySongRelationshipSection";

type LibrarySongDetailViewProps = LibrarySongDetailController & {
  detail: LibrarySongDetail;
  screenViewState: LibrarySongDetailScreenViewState;
};

export function LibrarySongDetailView({
  actionState,
  deleteCurrentSong,
  detail,
  exportCurrentSong,
  playCurrentSong,
  queueCurrentSong,
  screenViewState,
  toggleLiked,
}: LibrarySongDetailViewProps) {
  const theme = useCustomizationTheme();
  const { statusState, viewState } = screenViewState;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <LibrarySongDetailHeader detail={detail} />

      <LibrarySongDetailActions
        actionLinks={viewState.actionLinks}
        actionState={actionState}
        onDelete={deleteCurrentSong}
        onExport={exportCurrentSong}
        onPlay={playCurrentSong}
        onQueue={queueCurrentSong}
        onToggleLiked={toggleLiked}
      />

      <LibrarySongRelationshipSection
        emptyLabel={viewState.relationshipSections.artists.emptyLabel}
        items={viewState.relationshipSections.artists.items}
        title={viewState.relationshipSections.artists.title}
      />
      <LibrarySongRelationshipSection
        emptyLabel={viewState.relationshipSections.albums.emptyLabel}
        items={viewState.relationshipSections.albums.items}
        title={viewState.relationshipSections.albums.title}
      />
      <LibrarySongRelationshipSection
        emptyLabel={viewState.relationshipSections.playlists.emptyLabel}
        items={viewState.relationshipSections.playlists.items}
        title={viewState.relationshipSections.playlists.title}
      />

      <LibrarySongSourcePanel detail={detail} />

      <LibrarySongStatusPanel statusState={statusState} />

      <Link
        className="text-[15px] font-extrabold"
        href={viewState.backLink.href}
        style={{ color: theme.accent }}
      >
        {viewState.backLink.label}
      </Link>
    </ScrollView>
  );
}
