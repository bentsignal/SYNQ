import type { PrivacySettingsStatus } from "../types/privacy-settings";
import { getSettingsBackLink } from "./settings-navigation-service";

export const getPrivacyScreenViewState = () => ({
  backLink: getSettingsBackLink(),
  header: {
    kicker: "Preferences",
    subtitle: "Control local preferences for analytics and diagnostics.",
    title: "Privacy",
  },
  localFirstPanel: {
    body:
      "Your library, imports, backups, theme, and privacy preferences are stored on this device unless you choose to export or restore them.",
    title: "Local-first by default",
  },
  preference: {
    description:
      "Allow anonymous usage signals to help prioritize reliability and feature work.",
    title: "Analytics",
  },
});

export const getPrivacyScreenState = ({
  status,
}: {
  status: PrivacySettingsStatus;
}) => ({
  isAnalyticsDisabled: status === "loading",
  statusLabel:
    status === "loading"
      ? "Loading"
      : status === "saving"
        ? "Saving"
      : "Saved locally",
});

export const getPrivacyScreenControllerViewState = ({
  status,
}: {
  status: PrivacySettingsStatus;
}) => ({
  screenState: getPrivacyScreenState({ status }),
  viewState: getPrivacyScreenViewState(),
});
