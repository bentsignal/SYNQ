import { Link } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailController } from "../hooks/use-library-song-detail-controller";
import {
  getLibrarySongDetailStatusState,
  type LibrarySongDetail,
} from "../services/library-song-detail-service";
import { getLibrarySongDetailViewState } from "../services/library-song-interaction-service";
import { LibrarySongDetailActions } from "./LibrarySongDetailActions";
import { LibrarySongDetailHeader } from "./LibrarySongDetailHeader";
import {
  LibrarySongSourcePanel,
  LibrarySongStatusPanel,
} from "./LibrarySongDetailPanels";
import { LibrarySongRelationshipSection } from "./LibrarySongRelationshipSection";

type LibrarySongDetailViewProps = LibrarySongDetailController & {
  detail: LibrarySongDetail;
  errors: unknown[];
  songId: number;
};

export function LibrarySongDetailView({
  actionState,
  deleteCurrentSong,
  detail,
  error,
  errors,
  exportCurrentSong,
  playCurrentSong,
  queueCurrentSong,
  songId,
  toggleLiked,
}: LibrarySongDetailViewProps) {
  const theme = useCustomizationTheme();
  const viewState = getLibrarySongDetailViewState(detail);
  const statusState = getLibrarySongDetailStatusState({
    actionState,
    detail,
    errors,
    mutationError: error,
  });

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <LibrarySongDetailHeader detail={detail} />

      <LibrarySongDetailActions
        actionState={actionState}
        onDelete={deleteCurrentSong}
        onExport={exportCurrentSong}
        onPlay={playCurrentSong}
        onQueue={queueCurrentSong}
        onToggleLiked={toggleLiked}
        songId={songId}
      />

      <LibrarySongRelationshipSection
        emptyLabel={viewState.relationshipSections.artists.emptyLabel}
        items={viewState.relationshipSections.artists.items}
        kind={viewState.relationshipSections.artists.kind}
        title={viewState.relationshipSections.artists.title}
      />
      <LibrarySongRelationshipSection
        emptyLabel={viewState.relationshipSections.albums.emptyLabel}
        items={viewState.relationshipSections.albums.items}
        kind={viewState.relationshipSections.albums.kind}
        title={viewState.relationshipSections.albums.title}
      />
      <LibrarySongRelationshipSection
        emptyLabel={viewState.relationshipSections.playlists.emptyLabel}
        items={viewState.relationshipSections.playlists.items}
        kind={viewState.relationshipSections.playlists.kind}
        title={viewState.relationshipSections.playlists.title}
      />

      <LibrarySongSourcePanel detail={detail} />

      <LibrarySongStatusPanel
        statusState={statusState}
      />

      <Link
        href={viewState.backLink.href}
        style={[styles.backLink, { color: theme.accent }]}
      >
        {viewState.backLink.label}
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
