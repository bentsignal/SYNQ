import { StyleSheet, Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getLibrarySongEditFieldState } from "../services/library-song-form-service";

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
  const fieldState = getLibrarySongEditFieldState();
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
          {fieldState.title.label}
        </Text>
        <TextInput
          onChangeText={onChangeTitle}
          placeholder={fieldState.title.placeholder}
          placeholderTextColor={theme.mutedText}
          returnKeyType={fieldState.title.returnKeyType}
          style={inputStyle}
          value={title}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          {fieldState.artistNames.label}
        </Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={onChangeArtistNames}
          placeholder={fieldState.artistNames.placeholder}
          placeholderTextColor={theme.mutedText}
          returnKeyType={fieldState.artistNames.returnKeyType}
          style={inputStyle}
          value={artistNames}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          {fieldState.albumNames.label}
        </Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={onChangeAlbumNames}
          placeholder={fieldState.albumNames.placeholder}
          placeholderTextColor={theme.mutedText}
          returnKeyType={fieldState.albumNames.returnKeyType}
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
