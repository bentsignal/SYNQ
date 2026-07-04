import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { getImportPremiumHref } from "./import-navigation-service";

type ImportPremiumGateActionCommand = {
  haptic: HapticFeedbackType;
};

export const getImportPremiumGateActionCommand =
  (): ImportPremiumGateActionCommand => ({
    haptic: "light",
  });

export const getImportPremiumGateState = ({
  active,
  error,
  phase,
}: {
  active: boolean;
  error: string | null;
  phase: "checking" | "failure" | "ready";
}) => ({
  action: {
    href: getImportPremiumHref(),
    label: "Open Premium",
  },
  body: "Premium unlocks full batch import. Free imports save or export the first staged song.",
  canAccessImport: true,
  error,
  kicker: phase === "checking" ? "Checking premium" : "Premium import",
  title: active ? "Premium import active" : "Free import available",
});
