import { Link, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportResultScreenViewProps = {
  backHref: Href;
  backLabel: string;
  kicker: string;
  panelHint?: string;
  panelLabel: string;
  panelText: string;
  subtitle: string;
  title: string;
  tone: "accent" | "danger";
};

export function ImportResultScreenView({
  backHref,
  backLabel,
  kicker,
  panelHint,
  panelLabel,
  panelText,
  subtitle,
  title,
  tone,
}: ImportResultScreenViewProps) {
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
          style={{ color: theme[tone] }}
        >
          {kicker}
        </Text>
        <Text
          className="text-[34px] font-extrabold leading-10"
          style={{ color: theme.primaryText }}
        >
          {title}
        </Text>
        <Text
          className="max-w-[520px] text-[15px] leading-[22px]"
          style={{ color: theme.secondaryText }}
        >
          {subtitle}
        </Text>
      </View>

      <View
        className="gap-2 rounded-lg border p-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <Text
          className="text-xs font-extrabold uppercase"
          style={{ color: theme.secondaryText }}
        >
          {panelLabel}
        </Text>
        <Text className="text-sm leading-5" style={{ color: theme.primaryText }}>
          {panelText}
        </Text>
        {panelHint ? (
          <Text
            className="text-xs leading-[17px]"
            style={{ color: theme.mutedText }}
          >
            {panelHint}
          </Text>
        ) : null}
      </View>

      <Link
        className="text-[15px] font-extrabold"
        href={backHref}
        style={{ color: theme.accent }}
      >
        {backLabel}
      </Link>
    </ScrollView>
  );
}
