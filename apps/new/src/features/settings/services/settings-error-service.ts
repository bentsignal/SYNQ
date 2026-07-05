export const getCustomizationSettingsErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Customization settings failed.";

export const getPrivacySettingsErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Privacy settings failed.";
