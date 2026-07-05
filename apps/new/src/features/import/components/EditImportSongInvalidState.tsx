import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongEditInvalidState as ImportSongEditInvalidStateModel } from "../services/import-song-edit-screen-state-service";

type EditImportSongInvalidStateProps = {
  invalidState: ImportSongEditInvalidStateModel;
};

export function EditImportSongInvalidState({
  invalidState,
}: EditImportSongInvalidStateProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="flex-1 gap-3 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {invalidState.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {invalidState.title}
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        {invalidState.subtitle}
      </Text>

      <View className="flex-row flex-wrap gap-4">
        {invalidState.links.map((link) => (
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
    </View>
  );
}
