import { SupportScreenView } from "../components/SupportScreenView";
import { useSupportScreenController } from "../hooks/use-support-screen-controller";

export function SettingsSupportScreen() {
  return <SupportScreenView {...useSupportScreenController()} />;
}
