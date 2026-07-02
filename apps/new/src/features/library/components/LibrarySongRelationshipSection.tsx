import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getLibrarySongRelationshipHref,
  type LibrarySongRelationshipKind,
} from "../services/library-song-interaction-service";

type LibrarySongRelationshipSectionProps = {
  emptyLabel: string;
  items: { detail?: string; id: number; title: string }[];
  kind: LibrarySongRelationshipKind;
  title: string;
};

export function LibrarySongRelationshipSection({
  emptyLabel,
  items,
  kind,
  title,
}: LibrarySongRelationshipSectionProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.relationshipSection}>
      <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
        {title}
      </Text>
      <View
        style={[
          styles.relationshipList,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {items.length === 0 ? (
          <Text style={[styles.emptyRelationship, { color: theme.mutedText }]}>
            {emptyLabel}
          </Text>
        ) : (
          items.map((item) => (
            <Link
              asChild
              href={getLibrarySongRelationshipHref({ id: item.id, kind })}
              key={item.id}
            >
              <Pressable
                style={[
                  styles.relationshipRow,
                  { borderBottomColor: theme.borderSubtle },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.relationshipTitle,
                    { color: theme.primaryText },
                  ]}
                >
                  {item.title}
                </Text>
                {item.detail ? (
                  <Text
                    style={[
                      styles.relationshipDetail,
                      { color: theme.secondaryText },
                    ]}
                  >
                    {item.detail}
                  </Text>
                ) : null}
              </Pressable>
            </Link>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyRelationship: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    padding: 14,
  },
  relationshipDetail: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    maxWidth: 140,
    textAlign: "right",
  },
  relationshipList: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  relationshipRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  relationshipSection: {
    gap: 10,
  },
  relationshipTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
});
