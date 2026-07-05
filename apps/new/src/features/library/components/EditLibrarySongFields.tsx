import { Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getLibrarySongEditFieldState } from "../services/library-song-edit-screen-state-service";

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
      <View className="gap-2">
        <Text
          className="text-xs font-extrabold uppercase"
          style={{ color: theme.secondaryText }}
        >
          {fieldState.title.label}
        </Text>
        <TextInput
          className="min-h-[46px] rounded-lg border px-3.5 text-[15px]"
          onChangeText={onChangeTitle}
          placeholder={fieldState.title.placeholder}
          placeholderTextColor={theme.mutedText}
          returnKeyType={fieldState.title.returnKeyType}
          style={inputStyle}
          value={title}
        />
      </View>

      <View className="gap-2">
        <Text
          className="text-xs font-extrabold uppercase"
          style={{ color: theme.secondaryText }}
        >
          {fieldState.artistNames.label}
        </Text>
        <TextInput
          autoCapitalize="words"
          className="min-h-[46px] rounded-lg border px-3.5 text-[15px]"
          onChangeText={onChangeArtistNames}
          placeholder={fieldState.artistNames.placeholder}
          placeholderTextColor={theme.mutedText}
          returnKeyType={fieldState.artistNames.returnKeyType}
          style={inputStyle}
          value={artistNames}
        />
      </View>

      <View className="gap-2">
        <Text
          className="text-xs font-extrabold uppercase"
          style={{ color: theme.secondaryText }}
        >
          {fieldState.albumNames.label}
        </Text>
        <TextInput
          autoCapitalize="words"
          className="min-h-[46px] rounded-lg border px-3.5 text-[15px]"
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
