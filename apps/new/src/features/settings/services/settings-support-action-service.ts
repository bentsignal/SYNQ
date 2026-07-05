import * as StoreReview from "expo-store-review";
import { Linking } from "react-native";
import type { SupportAction } from "./settings-support-navigation-service";
import {
  runSettingsSupportActionWithDependencies,
  type SettingsSupportActionDependencies,
} from "./settings-support-action-executor-service";

const settingsSupportActionDependencies: SettingsSupportActionDependencies = {
  isReviewAvailable: StoreReview.isAvailableAsync,
  openUrl: Linking.openURL,
  requestReview: StoreReview.requestReview,
};

export const runSettingsSupportAction = async (action: SupportAction) => {
  await runSettingsSupportActionWithDependencies(
    action,
    settingsSupportActionDependencies,
  );
};
