import { ScrollView, StyleSheet } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetail } from "../hooks/use-library-song-detail-query";
import type { LibrarySongEditActionState } from "../services/library-song-form-service";
import { EditLibrarySongActions } from "./EditLibrarySongActions";
import { EditLibrarySongFields } from "./EditLibrarySongFields";
import { EditLibrarySongHeader } from "./EditLibrarySongHeader";
import { EditLibrarySongStatusPanel } from "./EditLibrarySongStatusPanel";

type EditLibrarySongFormViewProps = {
  actionState: LibrarySongEditActionState;
  albumNames: string;
  artistNames: string;
  errorMessage: string | null;
  hasErrors: boolean;
  detail: LibrarySongDetail;
  onChangeAlbumNames: (albumNames: string) => void;
  onChangeArtistNames: (artistNames: string) => void;
  onChangeTitle: (title: string) => void;
  onSave: () => void;
  songId: number;
  title: string;
};

export function EditLibrarySongFormView({
  actionState,
  albumNames,
  artistNames,
  detail,
  errorMessage,
  hasErrors,
  onChangeAlbumNames,
  onChangeArtistNames,
  onChangeTitle,
  onSave,
  songId,
  title,
}: EditLibrarySongFormViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <EditLibrarySongHeader detail={detail} />
      <EditLibrarySongFields
        albumNames={albumNames}
        artistNames={artistNames}
        onChangeAlbumNames={onChangeAlbumNames}
        onChangeArtistNames={onChangeArtistNames}
        onChangeTitle={onChangeTitle}
        title={title}
      />
      <EditLibrarySongActions
        actionState={actionState}
        onSave={onSave}
        songId={songId}
      />
      <EditLibrarySongStatusPanel
        detail={detail}
        errorMessage={errorMessage}
        hasErrors={hasErrors}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
});
