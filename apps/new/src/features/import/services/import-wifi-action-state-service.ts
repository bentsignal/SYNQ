import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getImportHomeHref,
  getImportSaveHref,
} from "./import-navigation-service";

export const getImportWifiActionState = () => ({
  backLink: {
    href: getImportHomeHref(),
    label: "Back to import",
  },
  reviewSave: {
    href: getImportSaveHref(),
    label: "Review save",
  },
});

export type ImportWifiActionState = ReturnType<
  typeof getImportWifiActionState
>;

export const getImportWifiReviewSaveHaptic = (): HapticFeedbackType => "light";
