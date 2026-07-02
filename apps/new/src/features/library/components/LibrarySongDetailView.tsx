import { Link } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailController } from "../hooks/use-library-song-detail-controller";
import {
  getLibrarySongDetailBackHref,
  type LibrarySongDetail,
} from "../services/library-song-detail-service";
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
  const hasErrors = errors.length > 0;
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${new Date(detail.updatedAt).toLocaleTimeString()}`
      : "Waiting for song data";

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
        emptyLabel="No artists linked"
        items={detail.artists}
        kind="artist"
        title="Artists"
      />
      <LibrarySongRelationshipSection
        emptyLabel="No albums linked"
        items={detail.albums.map((album) => ({
          detail:
            album.track !== null
              ? `${album.detail} / track ${album.track}`
              : album.detail,
          id: album.id,
          title: album.title,
        }))}
        kind="album"
        title="Albums"
      />
      <LibrarySongRelationshipSection
        emptyLabel="No playlists linked"
        items={detail.playlists}
        kind="playlist"
        title="Playlists"
      />

      <LibrarySongSourcePanel detail={detail} />

      <LibrarySongStatusPanel
        actionState={actionState}
        detail={detail}
        error={error}
        hasErrors={hasErrors}
        updatedLabel={updatedLabel}
      />

      <Link
        href={getLibrarySongDetailBackHref()}
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to Library
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
