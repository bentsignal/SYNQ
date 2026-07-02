import { ScrollView, StyleSheet, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongEditActionState } from "../services/import-song-form-service";
import type { ImportSongDraft } from "../types/import-session";
import { EditImportSongActions } from "./EditImportSongActions";
import { EditImportSongFields } from "./EditImportSongFields";
import { EditImportSongHeader } from "./EditImportSongHeader";
import { EditImportSongLinks } from "./EditImportSongLinks";
import { EditImportSongSourcePanel } from "./EditImportSongSourcePanel";

type EditImportSongFormViewProps = {
  actionState: ImportSongEditActionState;
  album: string;
  artist: string;
  error: string | null;
  onChangeAlbum: (album: string) => void;
  onChangeArtist: (artist: string) => void;
  onChangeTitle: (title: string) => void;
  onChangeTrack: (track: string) => void;
  onSave: () => void;
  song: ImportSongDraft;
  title: string;
  track: string;
};

export function EditImportSongFormView({
  actionState,
  album,
  artist,
  error,
  onChangeAlbum,
  onChangeArtist,
  onChangeTitle,
  onChangeTrack,
  onSave,
  song,
  title,
  track,
}: EditImportSongFormViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <EditImportSongHeader />

      <View
        style={[
          styles.form,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <EditImportSongFields
          album={album}
          artist={artist}
          onChangeAlbum={onChangeAlbum}
          onChangeArtist={onChangeArtist}
          onChangeTitle={onChangeTitle}
          onChangeTrack={onChangeTrack}
          title={title}
          track={track}
        />
        <EditImportSongSourcePanel fileName={song.fileName} />
        <EditImportSongActions
          actionState={actionState}
          error={error}
          onSave={onSave}
        />
      </View>

      <EditImportSongLinks />
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
  form: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
});
