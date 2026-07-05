import { getSettingsBackLink } from "../../settings/services/settings-navigation-service";

export const getBackupScreenState = () => ({
  backLink: getSettingsBackLink(),
});
