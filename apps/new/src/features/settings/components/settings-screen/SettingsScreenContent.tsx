import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import type { CustomizationTheme } from "../../hooks/use-customization-theme";

type SettingsScreenContentProps = {
  children: ReactNode;
  contentClassName?: string;
  theme: CustomizationTheme;
};

export function SettingsScreenContent({
  children,
  contentClassName,
  theme,
}: SettingsScreenContentProps) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName={`gap-[18px] px-5 py-14 ${
        contentClassName ?? ""
      }`}
      style={{ backgroundColor: theme.background }}
    >
      {children}
    </ScrollView>
  );
}

