export const parseSettingsJsonWithFallback = <TSettings>({
  contents,
  defaultSettings,
  normalizeSettings,
}: {
  contents: string;
  defaultSettings: TSettings;
  normalizeSettings: (value: unknown) => TSettings;
}) => {
  try {
    return normalizeSettings(JSON.parse(contents));
  } catch {
    return defaultSettings;
  }
};

export const stringifySettingsJson = <TSettings>({
  normalizeSettings,
  settings,
}: {
  normalizeSettings: (value: unknown) => TSettings;
  settings: TSettings;
}) => JSON.stringify(normalizeSettings(settings), null, 2);
