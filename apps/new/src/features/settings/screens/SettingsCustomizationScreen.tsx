import { CustomizationScreenView } from "../components/CustomizationScreenView";
import { useCustomizationScreenController } from "../hooks/use-customization-screen-controller";

export function SettingsCustomizationScreen() {
  return (
    <CustomizationScreenView {...useCustomizationScreenController()} />
  );
}
