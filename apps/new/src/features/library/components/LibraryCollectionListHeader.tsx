import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListHref } from "../services/library-collection-list-copy-service";
import { LibraryBackLink } from "./LibraryBackLink";

type LibraryCollectionListHeaderProps = {
  backLink: {
    href: LibraryCollectionListHref;
    label: string;
  };
  createLink: {
    href: LibraryCollectionListHref;
    label: string;
  };
  kicker: string;
  title: string;
};

export function LibraryCollectionListHeader({
  backLink,
  createLink,
  kicker,
  title,
}: LibraryCollectionListHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        <LibraryBackLink
          backLink={backLink}
          theme={theme}
          variant="header"
        />
        <Link
          className="text-sm font-extrabold uppercase"
          href={createLink.href}
          style={{ color: theme.accent }}
        >
          {createLink.label}
        </Link>
      </View>
    </View>
  );
}
