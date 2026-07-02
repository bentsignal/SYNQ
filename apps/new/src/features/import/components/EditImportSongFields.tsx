import { StyleSheet, Text, TextInput } from "react-native";
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
  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.background,
      borderColor: theme.border,
      color: theme.primaryText,
    },
  ];

  return (
    <>
      <Text style={[styles.label, { color: theme.primaryText }]}>
        {fieldState.title.label}
      </Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        onChangeText={onChangeTitle}
        placeholder={fieldState.title.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={fieldState.title.returnKeyType}
        style={inputStyle}
        value={title}
      />

      <Text style={[styles.label, { color: theme.primaryText }]}>
        {fieldState.artist.label}
      </Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        onChangeText={onChangeArtist}
        placeholder={fieldState.artist.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={fieldState.artist.returnKeyType}
        style={inputStyle}
        value={artist}
      />

      <Text style={[styles.label, { color: theme.primaryText }]}>
        {fieldState.album.label}
      </Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        onChangeText={onChangeAlbum}
        placeholder={fieldState.album.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={fieldState.album.returnKeyType}
        style={inputStyle}
        value={album}
      />

      <Text style={[styles.label, { color: theme.primaryText }]}>
        {fieldState.track.label}
      </Text>
      <TextInput
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

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 12,
  },
});
