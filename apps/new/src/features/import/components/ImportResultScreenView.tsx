import type { Href } from "expo-router";
import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { ImportResultBackLink } from "./ImportResultBackLink";
import { ImportResultHeader } from "./ImportResultHeader";
import { ImportResultPanel } from "./ImportResultPanel";

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
      <ImportResultHeader
        kicker={kicker}
        subtitle={subtitle}
        theme={theme}
        title={title}
        tone={tone}
      />

      <ImportResultPanel
        panelHint={panelHint}
        panelLabel={panelLabel}
        panelText={panelText}
        theme={theme}
      />

      <ImportResultBackLink href={backHref} label={backLabel} theme={theme} />
    </ScrollView>
  );
}
