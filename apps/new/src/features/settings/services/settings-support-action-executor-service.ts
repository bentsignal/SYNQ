import type { SupportAction } from "./settings-support-navigation-service";

export type SettingsSupportActionDependencies = {
  isReviewAvailable: () => Promise<boolean>;
  openUrl: (url: string) => Promise<unknown>;
  requestReview: () => Promise<unknown>;
};

export const runSettingsSupportActionWithDependencies = async (
  action: SupportAction,
  dependencies: SettingsSupportActionDependencies,
) => {
  if (action.type === "url") {
    await dependencies.openUrl(action.url);
    return;
  }

  if (await dependencies.isReviewAvailable()) {
    await dependencies.requestReview();
  }
};
