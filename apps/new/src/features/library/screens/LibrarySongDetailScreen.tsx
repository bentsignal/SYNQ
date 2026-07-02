import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { LibrarySongDetailActions } from "../components/LibrarySongDetailActions";
import { LibrarySongDetailHeader } from "../components/LibrarySongDetailHeader";
import {
  LibrarySongSourcePanel,
  LibrarySongStatusPanel,
} from "../components/LibrarySongDetailPanels";
import { LibrarySongRelationshipSection } from "../components/LibrarySongRelationshipSection";
import { useLibrarySongDetailController } from "../hooks/use-library-song-detail-controller";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";

export function LibrarySongDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const theme = useCustomizationTheme();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Song</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Invalid song
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          This route needs a numeric id.
        </Text>
        <Link
          href="/(tabs)/library"
          style={[styles.backLink, { color: theme.accent }]}
        >
          Back to Library
        </Link>
      </View>
    );
  }

  return <LibrarySongDetailContent songId={id} />;
}

function LibrarySongDetailContent({ songId }: { songId: number }) {
  const { detail, errors } = useLibrarySongDetailQuery(songId);
  const theme = useCustomizationTheme();
  const hasErrors = errors.length > 0;
  const {
    actionState,
    deleteCurrentSong,
    error,
    exportCurrentSong,
    playCurrentSong,
    queueCurrentSong,
    toggleLiked,
  } = useLibrarySongDetailController({
    detail,
    songId,
  });
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
        href="/(tabs)/library"
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
  screen: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
