import { Link, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type LibraryCollectionListHeaderProps = {
  createHref: Href;
  kicker: string;
  title: string;
};

export function LibraryCollectionListHeader({
  createHref,
  kicker,
  title,
}: LibraryCollectionListHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.kicker, { color: theme.accent }]}>{kicker}</Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>{title}</Text>
      <View style={styles.links}>
        <Link href="/(tabs)/library" style={[styles.link, { color: theme.accent }]}>
          Library
        </Link>
        <Link href={createHref} style={[styles.link, { color: theme.accent }]}>
          Create
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  link: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
});
