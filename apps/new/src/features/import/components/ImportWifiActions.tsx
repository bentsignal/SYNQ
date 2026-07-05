import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportWifiActionState } from "../services/import-wifi-action-state-service";

type ImportWifiActionsProps = {
  actionState: ImportWifiActionState;
  canReviewSave: boolean;
  reviewSave: () => void;
};

export function ImportWifiActions({
  actionState,
  canReviewSave,
  reviewSave,
}: ImportWifiActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="flex-row flex-wrap items-center gap-4">
      <Link asChild href={actionState.reviewSave.href}>
        <Pressable
          accessibilityRole="button"
          disabled={!canReviewSave}
          onPress={reviewSave}
          className={`min-h-[46px] min-w-[130px] items-center justify-center rounded-lg px-3.5 ${
            canReviewSave ? "" : "opacity-[0.45]"
          }`}
          style={{ backgroundColor: theme.accent }}
        >
          <Text
            className="text-[13px] font-extrabold uppercase"
            style={{ color: theme.onAccent }}
          >
            {actionState.reviewSave.label}
          </Text>
        </Pressable>
      </Link>
      <Link
        className="text-[15px] font-extrabold"
        href={actionState.backLink.href}
        style={{ color: theme.accent }}
      >
        {actionState.backLink.label}
      </Link>
    </View>
  );
}
