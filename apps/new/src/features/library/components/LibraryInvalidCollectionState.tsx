import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getLibraryInvalidCollectionState } from "../services/library-collection-navigation-service";

type LibraryInvalidCollectionStateProps = {
  kicker?: string;
};

export function LibraryInvalidCollectionState({
  kicker = "Library",
}: LibraryInvalidCollectionStateProps) {
  const theme = useCustomizationTheme();
  const state = getLibraryInvalidCollectionState({ kicker });

  return (
    <View
      className="flex-1 gap-2.5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <Text
        className="text-[13px] font-extrabold uppercase tracking-normal"
        style={{ color: theme.accent }}
      >
        {state.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10 tracking-normal"
        style={{ color: theme.primaryText }}
      >
        {state.title}
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        {state.body}
      </Text>
      <Link
        className="text-[15px] font-extrabold tracking-normal"
        href={state.backLink.href}
        style={{ color: theme.accent }}
      >
        {state.backLink.label}
      </Link>
    </View>
  );
}
