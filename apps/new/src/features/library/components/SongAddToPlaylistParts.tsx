import { Link } from "expo-router";
import { Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";
import type { getSongAddToPlaylistHeaderState } from "../services/song-add-to-playlist-header-state-service";
import type { SongAddToPlaylistRowState } from "../services/song-add-to-playlist-service";
import type { SongAddToPlaylistStatusState } from "../services/song-add-to-playlist-status-state-service";
import { SongAddToPlaylistRow } from "./SongAddToPlaylistRow";

type SongAddToPlaylistHeaderProps = {
  headerState: ReturnType<typeof getSongAddToPlaylistHeaderState>;
  theme: CustomizationTheme;
};

export function SongAddToPlaylistHeader({
  headerState,
  theme,
}: SongAddToPlaylistHeaderProps) {
  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {headerState.copy.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {headerState.copy.title}
      </Text>
      <Link
        className="text-sm font-extrabold uppercase"
        href={headerState.backLink.href}
        style={{ color: theme.accent }}
      >
        {headerState.backLink.label}
      </Link>
    </View>
  );
}

type SongAddToPlaylistListProps = {
  addToPlaylist: (playlistId: number) => void;
  listState: LibraryCollectionListState;
  rowStates: SongAddToPlaylistRowState[];
  theme: CustomizationTheme;
};

export function SongAddToPlaylistList({
  addToPlaylist,
  listState,
  rowStates,
  theme,
}: SongAddToPlaylistListProps) {
  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {listState.visibleCollections.length === 0 ? (
        <Text
          className="p-3.5 text-sm italic leading-5"
          style={{ color: theme.mutedText }}
        >
          {listState.emptyLabel}
        </Text>
      ) : (
        rowStates.map((rowState) => (
          <SongAddToPlaylistRow
            addToPlaylist={addToPlaylist}
            key={rowState.playlist.id}
            rowState={rowState}
            theme={theme}
          />
        ))
      )}
    </View>
  );
}

type SongAddToPlaylistStatusProps = {
  statusState: SongAddToPlaylistStatusState;
  theme: CustomizationTheme;
};

export function SongAddToPlaylistStatus({
  statusState,
  theme,
}: SongAddToPlaylistStatusProps) {
  return (
    <View
      className="rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className={`text-sm leading-5 ${statusState.hasError ? "font-bold" : ""}`}
        style={{
          color: statusState.hasError ? theme.danger : theme.secondaryText,
        }}
      >
        {statusState.label}
      </Text>
    </View>
  );
}
