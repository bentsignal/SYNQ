import { SettingsHomeView } from "../components/SettingsHomeView";
import { useSettingsHomeController } from "../hooks/use-settings-home-controller";

export function SettingsHomeScreen() {
  return <SettingsHomeView {...useSettingsHomeController()} />;
}
