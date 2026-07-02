import { PrivacyScreenView } from "../components/PrivacyScreenView";
import { usePrivacyScreenController } from "../hooks/use-privacy-screen-controller";

export function SettingsPrivacyScreen() {
  return <PrivacyScreenView {...usePrivacyScreenController()} />;
}
