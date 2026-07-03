import { Linking } from "react-native";
import { supportActions } from "../services/settings-navigation-service";
import { useHapticFeedback } from "./use-haptic-feedback";

export function useSupportScreenController() {
  const { sendHaptic } = useHapticFeedback();

  const openUrl = (url: string) => {
    sendHaptic("light");
    void Linking.openURL(url);
  };

  return {
    openUrl,
    supportActions,
  };
}

export type SupportScreenController = ReturnType<
  typeof useSupportScreenController
>;
