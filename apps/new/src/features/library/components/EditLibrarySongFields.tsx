import { StyleSheet, Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type EditLibrarySongFieldsProps = {
  albumNames: string;
  artistNames: string;
  onChangeAlbumNames: (albumNames: string) => void;
  onChangeArtistNames: (artistNames: string) => void;
  onChangeTitle: (title: string) => void;
  title: string;
};

export function EditLibrarySongFields({
  albumNames,
  artistNames,
  onChangeAlbumNames,
  onChangeArtistNames,
  onChangeTitle,
  title,
}: EditLibrarySongFieldsProps) {
  const theme = useCustomizationTheme();
  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      color: theme.primaryText,
    },
  ];

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          Title
        </Text>
        <TextInput
          onChangeText={onChangeTitle}
          placeholder="Song title"
          placeholderTextColor={theme.mutedText}
          returnKeyType="next"
          style={inputStyle}
          value={title}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          Artists
        </Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={onChangeArtistNames}
          placeholder="Artist names"
          placeholderTextColor={theme.mutedText}
          returnKeyType="next"
          style={inputStyle}
          value={artistNames}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          Albums
        </Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={onChangeAlbumNames}
          placeholder="Album names"
          placeholderTextColor={theme.mutedText}
          returnKeyType="done"
          style={inputStyle}
          value={albumNames}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 14,
  },
});
