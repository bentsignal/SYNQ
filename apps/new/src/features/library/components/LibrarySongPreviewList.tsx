import { StyleSheet, Text, View } from "react-native";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  LibrarySongPreview,
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../hooks/use-library-song-preview-query";
import { getLibrarySongPreviewListState } from "../services/library-song-preview-service";
import { LibrarySongListControls } from "./LibrarySongListControls";
import { LibrarySongPreviewEmptyState } from "./LibrarySongPreviewEmptyState";
import { LibrarySongPreviewRow } from "./LibrarySongPreviewRow";

type LibrarySongPreviewListProps = {
  isEmpty: boolean;
  order: LibrarySongPreviewOrder;
  query: string;
  setOrder: (order: LibrarySongPreviewOrder) => void;
  setQuery: (query: string) => void;
  setSort: (sort: LibrarySongPreviewSort) => void;
  songs: LibrarySongPreview[];
  sort: LibrarySongPreviewSort;
};

export function LibrarySongPreviewList({
  isEmpty,
  order,
  query,
  setOrder,
  setQuery,
  setSort,
  songs,
  sort,
}: LibrarySongPreviewListProps) {
  const theme = useCustomizationTheme();
  const { activeTrack, addToQueue, playSong } = usePlaybackSession();
  const listState = getLibrarySongPreviewListState({ songs });

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          {listState.title}
        </Text>
        <Text style={[styles.sectionMeta, { color: theme.secondaryText }]}>
          {listState.meta}
        </Text>
      </View>

      <LibrarySongListControls
        order={order}
        query={query}
        setOrder={setOrder}
        setQuery={setQuery}
        setSort={setSort}
        sort={sort}
      />

      {isEmpty ? (
        <LibrarySongPreviewEmptyState />
      ) : (
        <View
          style={[
            styles.list,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {songs.map((song) => (
            <LibrarySongPreviewRow
              activeTrackId={activeTrack?.id ?? null}
              addToQueue={addToQueue}
              key={song.id}
              playSong={playSong}
              song={song}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
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
  list: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
});
