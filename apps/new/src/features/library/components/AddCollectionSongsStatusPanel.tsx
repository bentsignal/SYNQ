import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddCollectionSongsStatusState } from "../services/addable-collection-songs-screen-state-service";

type AddCollectionSongsStatusPanelProps = {
  statusState: AddCollectionSongsStatusState;
};

export function AddCollectionSongsStatusPanel({
  statusState,
}: AddCollectionSongsStatusPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className={`text-sm leading-5 ${statusState.isError ? "font-bold" : ""}`}
        style={{
          color: statusState.isError ? theme.danger : theme.secondaryText,
        }}
      >
        {statusState.statusLabel}
      </Text>
    </View>
  );
}
