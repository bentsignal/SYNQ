import { StyleSheet, Text, TextInput } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

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
      <Text style={[styles.label, { color: theme.primaryText }]}>Title</Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        onChangeText={onChangeTitle}
        placeholder="Song title"
        placeholderTextColor={theme.mutedText}
        returnKeyType="next"
        style={inputStyle}
        value={title}
      />

      <Text style={[styles.label, { color: theme.primaryText }]}>Artist</Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        onChangeText={onChangeArtist}
        placeholder="Artist"
        placeholderTextColor={theme.mutedText}
        returnKeyType="next"
        style={inputStyle}
        value={artist}
      />

      <Text style={[styles.label, { color: theme.primaryText }]}>Album</Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        onChangeText={onChangeAlbum}
        placeholder="Album"
        placeholderTextColor={theme.mutedText}
        returnKeyType="next"
        style={inputStyle}
        value={album}
      />

      <Text style={[styles.label, { color: theme.primaryText }]}>Track</Text>
      <TextInput
        inputMode="numeric"
        keyboardType="number-pad"
        onChangeText={onChangeTrack}
        placeholder="Track number"
        placeholderTextColor={theme.mutedText}
        returnKeyType="done"
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
