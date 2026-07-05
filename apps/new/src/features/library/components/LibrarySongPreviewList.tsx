import { View } from "react-native";
import {
  usePlaybackActiveTrack,
  usePlaybackSongActions,
} from "@/src/features/playback/hooks/use-playback-session-selectors";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  LibrarySongPreview,
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../hooks/use-library-song-preview-query";
import { getLibrarySongPreviewListState } from "../services/library-song-preview-state-service";
import { LibrarySongListControls } from "./LibrarySongListControls";
import { LibrarySongPreviewEmptyState } from "./LibrarySongPreviewEmptyState";
import { LibrarySongPreviewRow } from "./LibrarySongPreviewRow";
import { LibrarySectionHeader } from "./LibrarySectionHeader";

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
  const activeTrack = usePlaybackActiveTrack();
  const { addToQueue, playSong } = usePlaybackSongActions();
  const listState = getLibrarySongPreviewListState({
    activeTrackId: activeTrack?.id ?? null,
    songs,
  });

  return (
    <View className="gap-3">
      <LibrarySectionHeader meta={listState.meta} title={listState.title} />

      <LibrarySongListControls
        order={order}
        query={query}
        setOrder={setOrder}
        setQuery={setQuery}
        setSort={setSort}
        sort={sort}
      />

      {isEmpty ? (
        <LibrarySongPreviewEmptyState emptyState={listState.emptyState} />
      ) : (
        <View
          className="overflow-hidden rounded-lg border"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          {listState.rows.map((row) => (
            <LibrarySongPreviewRow
              addToQueue={addToQueue}
              key={row.song.id}
              playSong={playSong}
              row={row}
            />
          ))}
        </View>
      )}
    </View>
  );
}
