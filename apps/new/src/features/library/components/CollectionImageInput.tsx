import { Image, Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { CollectionFormActionState } from "../services/collection-form-interaction-service";
import type { CollectionFormImage } from "./collection-form-types";

type CollectionImageInputProps = {
  actionState: CollectionFormActionState;
  image: CollectionFormImage;
  imageFallbackName?: string | null;
  imageFallbackUri?: string | null;
  imageInitial: string;
  imageLabel: string;
  onPickImage: () => void;
};

export function CollectionImageInput({
  actionState,
  image,
  imageFallbackName,
  imageFallbackUri,
  imageInitial,
  imageLabel,
  onPickImage,
}: CollectionImageInputProps) {
  const theme = useCustomizationTheme();
  const imageUri = image?.dataUrl ?? imageFallbackUri;
  const imageName =
    image?.fileName ??
    imageFallbackName ??
    `No ${imageLabel.toLowerCase()} selected`;

  return (
    <>
      <Text
        className="text-xs font-extrabold uppercase tracking-normal"
        style={{ color: theme.secondaryText }}
      >
        {imageLabel}
      </Text>
      <View className="flex-row items-center gap-3">
        {imageUri ? (
          <Image className="h-[72px] w-[72px] rounded-lg" source={{ uri: imageUri }} />
        ) : (
          <View
            className="h-[72px] w-[72px] items-center justify-center rounded-lg border"
            style={{ backgroundColor: theme.background, borderColor: theme.border }}
          >
            <Text
              className="text-2xl font-extrabold leading-[30px] tracking-normal"
              style={{ color: theme.accent }}
            >
              {imageInitial}
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
            disabled={!actionState.canPickImage}
            onPress={onPickImage}
            className="min-h-[34px] self-start items-center justify-center rounded-lg border px-2.5"
            style={{ borderColor: theme.border }}
          >
            <Text
              className="text-[11px] font-extrabold uppercase tracking-normal"
              style={{ color: theme.accent }}
            >
              Choose image
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
