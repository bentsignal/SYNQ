import { Image, Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongEditActionState } from "../services/library-song-edit-screen-state-service";
import type { LibrarySongEditFormState } from "../services/library-song-edit-form-state-service";

type EditLibrarySongCoverInputProps = {
  actionState: LibrarySongEditActionState;
  coverImage: LibrarySongEditFormState["coverImage"];
  fallbackUri: string | null;
  onPickCoverImage: () => void;
};

export function EditLibrarySongCoverInput({
  actionState,
  coverImage,
  fallbackUri,
  onPickCoverImage,
}: EditLibrarySongCoverInputProps) {
  const theme = useCustomizationTheme();
  const imageUri = coverImage?.dataUrl ?? fallbackUri;
  const imageName = coverImage?.fileName ?? "Song cover";

  return (
    <View className="gap-2">
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        Cover Image
      </Text>
      <View className="flex-row items-center gap-3">
        {imageUri ? (
          <Image
            className="h-[76px] w-[76px] rounded-lg"
            source={{ uri: imageUri }}
          />
        ) : (
          <View
            className="h-[76px] w-[76px] items-center justify-center rounded-lg border"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
          >
            <Text
              className="text-[28px] font-extrabold leading-[34px]"
              style={{ color: theme.accent }}
            >
              S
            </Text>
          </View>
        )}
        <View className="min-w-0 flex-1 gap-2">
          <Text
            className="text-[13px] font-bold leading-[18px]"
            style={{ color: theme.primaryText }}
          >
            {imageName}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="min-h-[34px] self-start items-center justify-center rounded-lg border px-2.5"
            disabled={!actionState.canPickCoverImage}
            onPress={onPickCoverImage}
            style={{ borderColor: theme.border }}
          >
            <Text
              className="text-[11px] font-extrabold uppercase"
              style={{ color: theme.accent }}
            >
              Choose image
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
