import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";
import type { LibraryCollectionPreview } from "../services/library-collection-preview-service";
import {
  getSongAddToPlaylistBackLink,
  getSongAddToPlaylistCopy,
  type SongAddToPlaylistMutationState,
} from "../services/song-add-to-playlist-service";

type SongAddToPlaylistHeaderProps = {
  songId: number;
  theme: CustomizationTheme;
};

export function SongAddToPlaylistHeader({
  songId,
  theme,
}: SongAddToPlaylistHeaderProps) {
  const copy = getSongAddToPlaylistCopy();
  const backLink = getSongAddToPlaylistBackLink({ songId });

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {copy.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {copy.title}
      </Text>
      <Link
        className="text-sm font-extrabold uppercase"
        href={backLink.href}
        style={{ color: theme.accent }}
      >
        {backLink.label}
      </Link>
    </View>
  );
}

type SongAddToPlaylistListProps = {
  addToPlaylist: (playlistId: number) => void;
  listState: LibraryCollectionListState;
  mutationState: SongAddToPlaylistMutationState;
  theme: CustomizationTheme;
};

export function SongAddToPlaylistList({
  addToPlaylist,
  listState,
  mutationState,
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
        listState.visibleCollections.map((playlist) => (
          <SongAddToPlaylistRow
            addToPlaylist={addToPlaylist}
            key={playlist.id}
            mutationState={mutationState}
            playlist={playlist}
            theme={theme}
          />
        ))
      )}
    </View>
  );
}

type SongAddToPlaylistRowProps = {
  addToPlaylist: (playlistId: number) => void;
  mutationState: SongAddToPlaylistMutationState;
  playlist: LibraryCollectionPreview;
  theme: CustomizationTheme;
};

function SongAddToPlaylistRow({
  addToPlaylist,
  mutationState,
  playlist,
  theme,
}: SongAddToPlaylistRowProps) {
  const pending = mutationState.pendingPlaylistId === playlist.id;
  const added = mutationState.successPlaylistId === playlist.id;

  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-16 flex-row items-center gap-3 border-b px-3.5 py-2.5 ${
        pending ? "opacity-[0.55]" : ""
      }`}
      disabled={pending}
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
            {playlist.title.slice(0, 1).toUpperCase()}
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
          {added ? "Added" : playlist.meta}
        </Text>
      </View>
      <Text
        className="max-w-[118px] text-right text-xs font-extrabold"
        style={{ color: added ? theme.accent : theme.primaryText }}
      >
        {pending ? "Adding" : playlist.detail}
      </Text>
    </Pressable>
  );
}

type SongAddToPlaylistStatusProps = {
  listState: LibraryCollectionListState;
  mutationState: SongAddToPlaylistMutationState;
  statusLabel: string;
  theme: CustomizationTheme;
};

export function SongAddToPlaylistStatus({
  listState,
  mutationState,
  statusLabel,
  theme,
}: SongAddToPlaylistStatusProps) {
  const hasError = mutationState.error || listState.hasErrors;

  return (
    <View
      className="rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className={`text-sm leading-5 ${hasError ? "font-bold" : ""}`}
        style={{
          color: hasError ? theme.danger : theme.secondaryText,
        }}
      >
        {listState.hasErrors ? listState.statusLabel : statusLabel}
      </Text>
    </View>
  );
}
