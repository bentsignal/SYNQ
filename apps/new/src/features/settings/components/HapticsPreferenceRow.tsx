import type { CustomizationTheme } from "../hooks/use-customization-theme";
import { SettingsSwitchRow } from "./SettingsSwitchRow";

type HapticsPreferenceRowProps = {
  disabled: boolean;
  hapticsEnabled: boolean;
  onChange: (hapticsEnabled: boolean) => void;
  theme: CustomizationTheme;
};

export function HapticsPreferenceRow({
  disabled,
  hapticsEnabled,
  onChange,
  theme,
}: HapticsPreferenceRowProps) {
  return (
    <SettingsSwitchRow
      description="Use a light tap response for supported controls."
      disabled={disabled}
      onChange={onChange}
      theme={theme}
      title="Haptic Feedback"
      trackColorOff="#cfd8d3"
      value={hapticsEnabled}
    />
  );
}
