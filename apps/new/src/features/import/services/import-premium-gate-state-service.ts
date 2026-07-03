import { getImportPremiumHref } from "./import-navigation-service";

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
