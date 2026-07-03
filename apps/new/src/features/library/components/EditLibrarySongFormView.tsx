import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetail } from "../hooks/use-library-song-detail-query";
import {
  getLibrarySongEditStatusState,
  type LibrarySongEditActionState,
} from "../services/library-song-edit-screen-state-service";
import { EditLibrarySongActions } from "./EditLibrarySongActions";
import { EditLibrarySongFields } from "./EditLibrarySongFields";
import { EditLibrarySongHeader } from "./EditLibrarySongHeader";
import { EditLibrarySongStatusPanel } from "./EditLibrarySongStatusPanel";

type EditLibrarySongFormViewProps = {
  actionState: LibrarySongEditActionState;
  albumNames: string;
  artistNames: string;
  errorMessage: string | null;
  errors: readonly unknown[];
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
  errors,
  onChangeAlbumNames,
  onChangeArtistNames,
  onChangeTitle,
  onSave,
  songId,
  title,
}: EditLibrarySongFormViewProps) {
  const theme = useCustomizationTheme();
  const statusState = getLibrarySongEditStatusState({
    detail,
    errors,
    mutationError: errorMessage,
  });

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
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
      <EditLibrarySongStatusPanel statusState={statusState} />
    </ScrollView>
  );
}
