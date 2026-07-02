import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useLibraryCollectionDetailController } from "../hooks/use-library-collection-detail-controller";
import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailKind,
} from "../services/library-collection-detail-service";
import { LibraryCollectionDetailActions } from "./LibraryCollectionDetailActions";
import { LibraryCollectionDetailHeader } from "./LibraryCollectionDetailHeader";
import { LibraryCollectionDetailStatus } from "./LibraryCollectionDetailStatus";
import { LibraryCollectionSongList } from "./LibraryCollectionSongList";

type LibraryCollectionDetailResult = {
  detail: LibraryCollectionDetail;
  errors: unknown[];
};

type LibraryCollectionDetailViewProps = {
  collection: LibraryCollectionDetailResult;
  id: number;
  kind: LibraryCollectionDetailKind;
};

export function LibraryCollectionDetailView({
  collection,
  id,
  kind,
}: LibraryCollectionDetailViewProps) {
  const { detail, errors } = collection;
  const theme = useCustomizationTheme();
  const hasErrors = errors.length > 0;
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${new Date(detail.updatedAt).toLocaleTimeString()}`
      : "Waiting for collection data";
  const {
    actionState,
    deleteCurrentCollection,
    exportCollection,
    moveSong,
    movingSongId,
    mutationError,
    playCollection,
    queueCollection,
    removeSong,
    removingSongId,
  } = useLibraryCollectionDetailController({
    detail,
    id,
    kind,
  });

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <LibraryCollectionDetailHeader
        detail={detail}
        updatedLabel={updatedLabel}
      />

      <LibraryCollectionDetailActions
        actionState={actionState}
        detail={detail}
        id={id}
        kind={kind}
        onDelete={deleteCurrentCollection}
        onExport={exportCollection}
        onPlay={playCollection}
        onQueue={queueCollection}
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          Songs
        </Text>
        <Text style={[styles.sectionMeta, { color: theme.secondaryText }]}>
          {detail.songs.length} songs
        </Text>
      </View>

      <LibraryCollectionSongList
        movingSongId={movingSongId}
        onMoveSong={moveSong}
        onRemoveSong={removeSong}
        removingSongId={removingSongId}
        songs={detail.songs}
      />

      <LibraryCollectionDetailStatus
        hasErrors={hasErrors}
        mutationError={mutationError}
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
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 17,
    textTransform: "uppercase",
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
