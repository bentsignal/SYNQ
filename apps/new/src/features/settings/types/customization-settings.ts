export type CustomizationColorKey =
  | "blue"
  | "mint"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "yellow";

export type CustomizationOption = {
  color: string;
  key: CustomizationColorKey;
  label: string;
};

export type CustomizationSettings = {
  appIcon: CustomizationColorKey;
  hapticsEnabled: boolean;
  theme: CustomizationColorKey;
};

export type CustomizationSettingsStatus =
  | "error"
  | "idle"
  | "loading"
  | "saving";
