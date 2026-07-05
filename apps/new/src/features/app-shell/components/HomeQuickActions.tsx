import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeAction as HomeActionState } from "../services/home-screen-service";

type HomeQuickActionsProps = {
  actions: HomeActionState[];
};

export function HomeQuickActions({ actions }: HomeQuickActionsProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {actions.map((action) => (
        <HomeAction action={action} key={action.href} />
      ))}
    </View>
  );
}

type HomeActionProps = {
  action: HomeActionState;
};

function HomeAction({ action }: HomeActionProps) {
  const theme = useCustomizationTheme();

  return (
    <Link asChild href={action.href}>
      <Pressable
        className="min-h-[94px] min-w-[148px] flex-grow basis-[47%] gap-1.5 rounded-lg border p-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <Text
          className="text-[17px] font-extrabold"
          style={{ color: theme.primaryText }}
        >
          {action.label}
        </Text>
        <Text
          className="text-[13px] leading-[18px]"
          style={{ color: theme.secondaryText }}
        >
          {action.detail}
        </Text>
      </Pressable>
    </Link>
  );
}
