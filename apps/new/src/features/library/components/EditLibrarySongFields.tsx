import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getLibrarySongEditFieldState } from "../services/library-song-edit-field-state-service";
import { EditLibrarySongFieldInput } from "./EditLibrarySongFieldInput";

type EditLibrarySongFieldsProps = {
  albumNames: string;
  artistNames: string;
  fieldState: ReturnType<typeof getLibrarySongEditFieldState>;
  onChangeAlbumNames: (albumNames: string) => void;
  onChangeArtistNames: (artistNames: string) => void;
  onChangeTitle: (title: string) => void;
  title: string;
};

export function EditLibrarySongFields({
  albumNames,
  artistNames,
  fieldState,
  onChangeAlbumNames,
  onChangeArtistNames,
  onChangeTitle,
  title,
}: EditLibrarySongFieldsProps) {
  const theme = useCustomizationTheme();
  const inputStyle = {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    color: theme.primaryText,
  };

  return (
    <View className="gap-3.5">
      <EditLibrarySongFieldInput
        fieldState={fieldState.title}
        inputStyle={inputStyle}
        onChangeText={onChangeTitle}
        placeholderTextColor={theme.mutedText}
        secondaryTextColor={theme.secondaryText}
        value={title}
      />
      <EditLibrarySongFieldInput
        autoCapitalize="words"
        fieldState={fieldState.artistNames}
        inputStyle={inputStyle}
        onChangeText={onChangeArtistNames}
        placeholderTextColor={theme.mutedText}
        secondaryTextColor={theme.secondaryText}
        value={artistNames}
      />
      <EditLibrarySongFieldInput
        autoCapitalize="words"
        fieldState={fieldState.albumNames}
        inputStyle={inputStyle}
        onChangeText={onChangeAlbumNames}
        placeholderTextColor={theme.mutedText}
        secondaryTextColor={theme.secondaryText}
        value={albumNames}
      />
    </View>
  );
}
