import { Text, TextInput } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getImportSongEditFieldState } from "../services/import-song-form-service";

type EditImportSongFieldsProps = {
  album: string;
  artist: string;
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
  onChangeAlbum,
  onChangeArtist,
  onChangeTitle,
  onChangeTrack,
  title,
  track,
}: EditImportSongFieldsProps) {
  const theme = useCustomizationTheme();
  const fieldState = getImportSongEditFieldState();
  const inputStyle = {
    backgroundColor: theme.background,
    borderColor: theme.border,
    color: theme.primaryText,
  };

  return (
    <>
      <Text
        className="text-[13px] font-extrabold"
        style={{ color: theme.primaryText }}
      >
        {fieldState.title.label}
      </Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        className="min-h-[46px] rounded-lg border px-3 text-base"
        onChangeText={onChangeTitle}
        placeholder={fieldState.title.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={fieldState.title.returnKeyType}
        style={inputStyle}
        value={title}
      />

      <Text
        className="text-[13px] font-extrabold"
        style={{ color: theme.primaryText }}
      >
        {fieldState.artist.label}
      </Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        className="min-h-[46px] rounded-lg border px-3 text-base"
        onChangeText={onChangeArtist}
        placeholder={fieldState.artist.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={fieldState.artist.returnKeyType}
        style={inputStyle}
        value={artist}
      />

      <Text
        className="text-[13px] font-extrabold"
        style={{ color: theme.primaryText }}
      >
        {fieldState.album.label}
      </Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        className="min-h-[46px] rounded-lg border px-3 text-base"
        onChangeText={onChangeAlbum}
        placeholder={fieldState.album.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={fieldState.album.returnKeyType}
        style={inputStyle}
        value={album}
      />

      <Text
        className="text-[13px] font-extrabold"
        style={{ color: theme.primaryText }}
      >
        {fieldState.track.label}
      </Text>
      <TextInput
        className="min-h-[46px] rounded-lg border px-3 text-base"
        inputMode="numeric"
        keyboardType="number-pad"
        onChangeText={onChangeTrack}
        placeholder={fieldState.track.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={fieldState.track.returnKeyType}
        style={inputStyle}
        value={track}
      />
    </>
  );
}
