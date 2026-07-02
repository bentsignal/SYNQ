import { Image, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";

type LibraryCollectionDetailHeaderProps = {
  detail: LibraryCollectionDetail;
  updatedLabel: string;
};

export function LibraryCollectionDetailHeader({
  detail,
  updatedLabel,
}: LibraryCollectionDetailHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <View style={styles.header}>
        {detail.imagePath ? (
          <Image source={{ uri: detail.imagePath }} style={styles.heroImage} />
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.heroInitial, { color: theme.accent }]}>
              {detail.title.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {detail.eyebrow}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {detail.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {detail.meta}
        </Text>
      </View>

      <View
        style={[
          styles.summaryPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.summaryValue, { color: theme.primaryText }]}>
          {detail.detail}
        </Text>
        <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
          {detail.isMissing ? "Collection not found" : updatedLabel}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  heroImage: {
    borderRadius: 8,
    height: 132,
    width: 132,
  },
  heroPlaceholder: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    height: 132,
    justifyContent: "center",
    width: 132,
  },
  heroInitial: {
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 52,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  summaryPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 28,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
});
