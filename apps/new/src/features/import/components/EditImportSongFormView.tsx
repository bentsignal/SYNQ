import { ScrollView, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  ImportSongEditActionState,
  ImportSongEditControllerResultState,
} from "../services/import-song-edit-form-state-service";
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
  backLinks: ImportSongEditControllerResultState["backLinks"];
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
  backLinks,
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
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <EditImportSongHeader />

      <View
        className="gap-2.5 rounded-lg border p-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
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

      <EditImportSongLinks links={backLinks} />
    </ScrollView>
  );
}
