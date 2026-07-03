import { Link } from "expo-router";
import { Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getLibraryHomeHeaderState } from "../services/library-home-header-service";

type LibraryHomeHeaderState = ReturnType<typeof getLibraryHomeHeaderState>;

type LibraryHomeHeaderProps = {
  headerState: LibraryHomeHeaderState;
  theme: CustomizationTheme;
};

export function LibraryHomeHeader({
  headerState,
  theme,
}: LibraryHomeHeaderProps) {
  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase tracking-normal"
        style={{ color: theme.accent }}
      >
        {headerState.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10 tracking-normal"
        style={{ color: theme.primaryText }}
      >
        {headerState.title}
      </Text>
      <Text
        className="max-w-[460px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        {headerState.subtitle}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {headerState.actions.map((action) => (
          <Link
            className="text-sm font-extrabold uppercase tracking-normal"
            href={action.href}
            key={action.href}
            style={{ color: theme.accent }}
          >
            {action.label}
          </Link>
        ))}
      </View>
    </View>
  );
}
