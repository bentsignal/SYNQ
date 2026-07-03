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
  body: "Unlock file and Wi-Fi import before staging new songs.",
  canAccessImport: active,
  error,
  kicker: phase === "checking" ? "Checking premium" : "Premium import",
  title: "Import is a Premium feature",
});
