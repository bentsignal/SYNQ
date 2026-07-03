import * as StoreReview from "expo-store-review";
import { Linking } from "react-native";
import {
  supportActions,
  type SupportAction,
} from "../services/settings-navigation-service";
import { getSettingsInteractionCommand } from "../services/settings-screen-service";
import { useHapticFeedback } from "./use-haptic-feedback";

export function useSupportScreenController() {
  const { sendHaptic } = useHapticFeedback();

  const openUrl = (url: string) => {
    sendHaptic(getSettingsInteractionCommand().haptic);
    void Linking.openURL(url);
  };

  const requestReview = async () => {
    sendHaptic(getSettingsInteractionCommand().haptic);
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
    }
  };

  const runSupportAction = (action: SupportAction) => {
    if (action.type === "review") {
      void requestReview();
      return;
    }

    openUrl(action.url);
  };

  return {
    openUrl,
    runSupportAction,
    supportActions,
  };
}

export type SupportScreenController = ReturnType<
  typeof useSupportScreenController
>;
