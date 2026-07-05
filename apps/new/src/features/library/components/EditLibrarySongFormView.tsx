import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetail } from "../hooks/use-library-song-detail-query";
import {
  type LibrarySongEditActionState,
  type LibrarySongEditScreenViewState,
} from "../services/library-song-edit-screen-state-service";
import type { LibrarySongEditFormState } from "../services/library-song-edit-form-state-service";
import { EditLibrarySongActions } from "./EditLibrarySongActions";
import { EditLibrarySongCoverInput } from "./EditLibrarySongCoverInput";
import { EditLibrarySongFields } from "./EditLibrarySongFields";
import { EditLibrarySongHeader } from "./EditLibrarySongHeader";
import { EditLibrarySongStatusPanel } from "./EditLibrarySongStatusPanel";

type EditLibrarySongFormViewProps = {
  actionState: LibrarySongEditActionState;
  albumNames: string;
  artistNames: string;
  coverImage: LibrarySongEditFormState["coverImage"];
  detail: LibrarySongDetail;
  onChangeAlbumNames: (albumNames: string) => void;
  onChangeArtistNames: (artistNames: string) => void;
  onChangeTitle: (title: string) => void;
  onPickCoverImage: () => void;
  onSave: () => void;
  screenViewState: LibrarySongEditScreenViewState;
  title: string;
};

export function EditLibrarySongFormView({
  actionState,
  albumNames,
  artistNames,
  coverImage,
  detail,
  onChangeAlbumNames,
  onChangeArtistNames,
  onChangeTitle,
  onPickCoverImage,
  onSave,
  screenViewState,
  title,
}: EditLibrarySongFormViewProps) {
  const theme = useCustomizationTheme();
  const { fieldState, statusState } = screenViewState;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <EditLibrarySongHeader detail={detail} />
      <EditLibrarySongCoverInput
        actionState={actionState}
        coverImage={coverImage}
        fallbackUri={detail.coverImagePath}
        onPickCoverImage={onPickCoverImage}
      />
      <EditLibrarySongFields
        albumNames={albumNames}
        artistNames={artistNames}
        fieldState={fieldState}
        onChangeAlbumNames={onChangeAlbumNames}
        onChangeArtistNames={onChangeArtistNames}
        onChangeTitle={onChangeTitle}
        title={title}
      />
      <EditLibrarySongActions
        actionState={actionState}
        onSave={onSave}
      />
      <EditLibrarySongStatusPanel statusState={statusState} />
    </ScrollView>
  );
}
