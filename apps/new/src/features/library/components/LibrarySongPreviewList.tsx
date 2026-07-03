import { Text, View } from "react-native";
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
  const listState = getLibrarySongPreviewListState({ songs });

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between gap-3">
        <Text
          className="flex-1 text-xl font-extrabold leading-[25px] tracking-normal"
          style={{ color: theme.primaryText }}
        >
          {listState.title}
        </Text>
        <Text
          className="text-xs font-extrabold uppercase leading-[17px] tracking-normal"
          style={{ color: theme.secondaryText }}
        >
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
          className="overflow-hidden rounded-lg border"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
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
