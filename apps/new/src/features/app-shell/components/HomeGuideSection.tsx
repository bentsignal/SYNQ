import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeScreenViewState } from "../services/home-screen-service";

type HomeGuideSectionProps = {
  guideSections: HomeScreenViewState["guideSections"];
};

export function HomeGuideSection({ guideSections }: HomeGuideSectionProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text
          className="text-[22px] font-extrabold leading-7"
          style={{ color: theme.primaryText }}
        >
          Setup Guide
        </Text>
        <Text
          className="text-sm leading-5"
          style={{ color: theme.secondaryText }}
        >
          Spotify setup, export, and network transfer notes.
        </Text>
      </View>

      <View
        className="overflow-hidden rounded-lg border"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {guideSections.map((section) => (
          <View
            className="gap-3 border-b p-4"
            key={section.title}
            style={{ borderBottomColor: theme.borderSubtle }}
          >
            <View className="gap-1">
              <Text
                className="text-base font-extrabold leading-[22px]"
                style={{ color: theme.primaryText }}
              >
                {section.title}
              </Text>
              <Text
                className="text-sm leading-5"
                style={{ color: theme.secondaryText }}
              >
                {section.body}
              </Text>
            </View>

            <View className="gap-2">
              {section.steps.map((step, index) => (
                <View className="flex-row gap-2.5" key={step}>
                  <Text
                    className="min-w-5 text-sm font-extrabold leading-5"
                    style={{ color: theme.accent }}
                  >
                    {index + 1}.
                  </Text>
                  <Text
                    className="min-w-0 flex-1 text-sm leading-5"
                    style={{ color: theme.primaryText }}
                  >
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
