import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongEditControllerResultState } from "../services/import-song-edit-form-state-service";
import { EditImportSongTextField } from "./EditImportSongTextField";

type EditImportSongFieldsProps = {
  album: string;
  artist: string;
  fieldState: ImportSongEditControllerResultState["fieldState"];
  onChangeAlbum: (album: string) => void;
  onChangeArtist: (artist: string) => void;
  onChangeTitle: (title: string) => void;
  onChangeTrack: (track: string) => void;
  title: string;
  track: string;
};

export function EditImportSongFields({
  album,
  artist,
  fieldState,
  onChangeAlbum,
  onChangeArtist,
  onChangeTitle,
  onChangeTrack,
  title,
  track,
}: EditImportSongFieldsProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <EditImportSongTextField
        label={fieldState.title.label}
        onChangeText={onChangeTitle}
        placeholder={fieldState.title.placeholder}
        returnKeyType={fieldState.title.returnKeyType}
        theme={theme}
        value={title}
      />
      <EditImportSongTextField
        label={fieldState.artist.label}
        onChangeText={onChangeArtist}
        placeholder={fieldState.artist.placeholder}
        returnKeyType={fieldState.artist.returnKeyType}
        theme={theme}
        value={artist}
      />
      <EditImportSongTextField
        label={fieldState.album.label}
        onChangeText={onChangeAlbum}
        placeholder={fieldState.album.placeholder}
        returnKeyType={fieldState.album.returnKeyType}
        theme={theme}
        value={album}
      />
      <EditImportSongTextField
        inputMode="numeric"
        keyboardType="number-pad"
        label={fieldState.track.label}
        onChangeText={onChangeTrack}
        placeholder={fieldState.track.placeholder}
        returnKeyType={fieldState.track.returnKeyType}
        theme={theme}
        value={track}
      />
    </>
  );
}
