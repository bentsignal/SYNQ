import { Link, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { EditImportSongFormView } from "../components/EditImportSongFormView";
import { useEditImportSongController } from "../hooks/use-edit-import-song-controller";
import { useImportSession } from "../hooks/use-import-session";
import type { ImportSongDraft } from "../types/import-session";

export function EditImportSongScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const theme = useCustomizationTheme();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Import edit
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Invalid song
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          This route needs a numeric id.
        </Text>
        <Link href="/(tabs)/import/save" style={[styles.backLink, { color: theme.accent }]}>
          Back to save
        </Link>
      </View>
    );
  }

  return <EditImportSongContent songId={id} />;
}

function EditImportSongContent({ songId }: { songId: number }) {
  const { state, updateImportSong } = useImportSession();
  const theme = useCustomizationTheme();
  const song = useMemo(
    () => state.songs.find((draft) => draft.id === songId) ?? null,
    [songId, state.songs],
  );

  if (!song) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Import edit
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Song not staged
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Choose songs again or return to the current review.
        </Text>
        <View style={styles.linkRow}>
          <Link
            href="/(tabs)/import/files"
            style={[styles.backLink, { color: theme.accent }]}
          >
            Back to files
          </Link>
          <Link
            href="/(tabs)/import/save"
            style={[styles.backLink, { color: theme.accent }]}
          >
            Back to save
          </Link>
        </View>
      </View>
    );
  }

  return <EditImportSongForm song={song} updateImportSong={updateImportSong} />;
}

function EditImportSongForm({
  song,
  updateImportSong,
}: {
  song: ImportSongDraft;
  updateImportSong: (song: ImportSongDraft) => void;
}) {
  const {
    actionState,
    album,
    artist,
    error,
    save,
    setAlbum,
    setArtist,
    title,
    track,
    updateTitle,
    updateTrack,
  } = useEditImportSongController({ song, updateImportSong });

  return (
    <EditImportSongFormView
      actionState={actionState}
      album={album}
      artist={artist}
      error={error}
      onChangeAlbum={setAlbum}
      onChangeArtist={setArtist}
      onChangeTitle={updateTitle}
      onChangeTrack={updateTrack}
      onSave={save}
      song={song}
      title={title}
      track={track}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 12,
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
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
