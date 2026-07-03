import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportHomeController } from "../hooks/use-import-home-controller";

type ImportHomeViewProps = ImportHomeController;

export function ImportHomeView({
  onSelectImportRoute,
  screenState,
}: ImportHomeViewProps) {
  const theme = useCustomizationTheme();

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
          Add Music
        </Text>
        <Text
          className="text-[34px] font-extrabold leading-10"
          style={{ color: theme.primaryText }}
        >
          Import
        </Text>
        <Text
          className="max-w-[520px] text-[15px] leading-[22px]"
          style={{ color: theme.secondaryText }}
        >
          Bring songs into SYNQ with a review step before saving.
        </Text>
      </View>

      <View
        className="overflow-hidden rounded-lg border"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {screenState.routes.map((route) => (
          <Link asChild href={route.href} key={route.label}>
            <Pressable
              className="min-h-[76px] flex-row items-center gap-3.5 border-b px-4 py-3.5"
              onPress={onSelectImportRoute}
              style={{ borderBottomColor: theme.borderSubtle }}
            >
              <View className="min-w-0 flex-1 gap-[5px]">
                <Text
                  className="text-base font-extrabold leading-[21px]"
                  style={{ color: theme.primaryText }}
                >
                  {route.label}
                </Text>
                <Text
                  className="text-[13px] leading-[19px]"
                  style={{ color: theme.secondaryText }}
                >
                  {route.description}
                </Text>
              </View>
              <Text
                className="text-right text-xs font-extrabold uppercase"
                style={{ color: theme.accent }}
              >
                {route.metaLabel}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
