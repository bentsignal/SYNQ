import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportFilesController } from "../hooks/use-import-files-controller";
import { getImportFilesActionLinks } from "../services/import-files-screen-state-service";
import { ImportPremiumGate } from "./ImportPremiumGate";
import { ImportSongPreviewList } from "./ImportSongPreviewList";

type ImportFilesScreenViewProps = ImportFilesController;

export function ImportFilesScreenView({
  actionState,
  chooseFiles,
  removeSong,
  state,
}: ImportFilesScreenViewProps) {
  const theme = useCustomizationTheme();
  const actionLinks = getImportFilesActionLinks();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <View className="gap-2">
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          Import files
        </Text>
        <Text
          className="text-[34px] font-extrabold leading-10"
          style={{ color: theme.primaryText }}
        >
          Files
        </Text>
        <Text
          className="max-w-[520px] text-[15px] leading-[22px]"
          style={{ color: theme.secondaryText }}
        >
          Stage songs here before choosing whether to save them.
        </Text>
      </View>

      <ImportPremiumGate>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canChooseFiles}
          onPress={chooseFiles}
          className={`min-h-[46px] items-center justify-center rounded-lg px-4 ${
            actionState.canChooseFiles ? "" : "opacity-50"
          }`}
          style={{ backgroundColor: theme.accent }}
        >
          <Text
            className="text-[13px] font-extrabold uppercase"
            style={{ color: theme.onAccent }}
          >
            {actionState.chooseLabel}
          </Text>
        </Pressable>
      </ImportPremiumGate>

      <ImportSongPreviewList
        canEditSongs
        onRemoveSong={removeSong}
        songs={state.songs}
      />

      <View className="flex-row flex-wrap gap-4">
        {actionLinks.map((link) => (
          <Link
            className="text-[15px] font-extrabold"
            href={link.href}
            key={link.href}
            style={{ color: theme.accent }}
          >
            {link.label}
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
