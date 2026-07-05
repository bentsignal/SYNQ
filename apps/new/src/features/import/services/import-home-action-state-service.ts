import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";

type ImportHomeInteractionCommand = {
  haptic: HapticFeedbackType;
};

export const getImportHomeRouteSelectCommand =
  (): ImportHomeInteractionCommand => ({
    haptic: "light",
  });
