import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type LibrarySongRelationshipSectionProps = {
  emptyLabel: string;
  items: { detail?: string; href: string; id: number; title: string }[];
  title: string;
};

export function LibrarySongRelationshipSection({
  emptyLabel,
  items,
  title,
}: LibrarySongRelationshipSectionProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2.5">
      <Text
        className="text-xl font-extrabold leading-[25px] tracking-normal"
        style={{ color: theme.primaryText }}
      >
        {title}
      </Text>
      <View
        className="overflow-hidden rounded-lg border"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {items.length === 0 ? (
          <Text
            className="p-3.5 text-sm italic leading-5"
            style={{ color: theme.mutedText }}
          >
            {emptyLabel}
          </Text>
        ) : (
          items.map((item) => (
            <Link
              asChild
              href={item.href}
              key={item.id}
            >
              <Pressable
                className="min-h-[54px] flex-row items-center gap-3 border-b px-3.5 py-2.5"
                style={{ borderBottomColor: theme.borderSubtle }}
              >
                <Text
                  className="flex-1 text-[15px] font-extrabold leading-5 tracking-normal"
                  numberOfLines={1}
                  style={{ color: theme.primaryText }}
                >
                  {item.title}
                </Text>
                {item.detail ? (
                  <Text
                    className="max-w-[140px] text-right text-xs font-extrabold tracking-normal"
                    style={{ color: theme.secondaryText }}
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
