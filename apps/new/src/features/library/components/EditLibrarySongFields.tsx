import { Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getLibrarySongEditFieldState } from "../services/library-song-edit-field-state-service";

type EditLibrarySongFieldState = ReturnType<
  typeof getLibrarySongEditFieldState
>[keyof ReturnType<typeof getLibrarySongEditFieldState>];

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

function EditLibrarySongFieldInput({
  autoCapitalize,
  fieldState,
  inputStyle,
  onChangeText,
  placeholderTextColor,
  secondaryTextColor,
  value,
}: {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  fieldState: EditLibrarySongFieldState;
  inputStyle: {
    backgroundColor: string;
    borderColor: string;
    color: string;
  };
  onChangeText: (value: string) => void;
  placeholderTextColor: string;
  secondaryTextColor: string;
  value: string;
}) {
  return (
    <View className="gap-2">
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: secondaryTextColor }}
      >
        {fieldState.label}
      </Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        className="min-h-[46px] rounded-lg border px-3.5 text-[15px]"
        onChangeText={onChangeText}
        placeholder={fieldState.placeholder}
        placeholderTextColor={placeholderTextColor}
        returnKeyType={fieldState.returnKeyType}
        style={inputStyle}
        value={value}
      />
    </View>
  );
}
