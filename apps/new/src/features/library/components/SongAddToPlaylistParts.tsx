import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";
import {
  type getSongAddToPlaylistHeaderState,
  type SongAddToPlaylistRowState,
  type SongAddToPlaylistStatusState,
} from "../services/song-add-to-playlist-service";

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

type SongAddToPlaylistRowProps = {
  addToPlaylist: (playlistId: number) => void;
  rowState: SongAddToPlaylistRowState;
  theme: CustomizationTheme;
};

function SongAddToPlaylistRow({
  addToPlaylist,
  rowState,
  theme,
}: SongAddToPlaylistRowProps) {
  const { playlist } = rowState;

  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-16 flex-row items-center gap-3 border-b px-3.5 py-2.5 ${
        rowState.isPending ? "opacity-[0.55]" : ""
      }`}
      disabled={rowState.isDisabled}
      onPress={() => addToPlaylist(playlist.id)}
      style={{ borderBottomColor: theme.borderSubtle }}
    >
      {playlist.imagePath ? (
        <Image
          className="h-11 w-11 rounded-md"
          source={{ uri: playlist.imagePath }}
        />
      ) : (
        <View
          className="h-11 w-11 items-center justify-center rounded-md"
          style={{ backgroundColor: theme.background }}
        >
          <Text
            className="text-base font-extrabold leading-[21px]"
            style={{ color: theme.accent }}
          >
            {rowState.imageInitial}
          </Text>
        </View>
      )}
      <View className="min-w-0 flex-1 gap-1">
        <Text
          className="text-[15px] font-extrabold leading-5"
          numberOfLines={1}
          style={{ color: theme.primaryText }}
        >
          {playlist.title}
        </Text>
        <Text
          className="text-[13px] leading-[18px]"
          numberOfLines={1}
          style={{ color: theme.secondaryText }}
        >
          {rowState.metaLabel}
        </Text>
      </View>
      <Text
        className="max-w-[118px] text-right text-xs font-extrabold"
        style={{ color: rowState.isAdded ? theme.accent : theme.primaryText }}
      >
        {rowState.detailLabel}
      </Text>
    </Pressable>
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
