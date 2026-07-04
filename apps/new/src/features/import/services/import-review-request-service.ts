import * as FileSystem from "expo-file-system";
import * as StoreReview from "expo-store-review";
import {
  loadSettingsFromJsonFileWithDependencies,
  saveSettingsToJsonFileWithDependencies,
  type SettingsJsonFileStoreDependencies,
} from "../../settings/services/settings-json-file-store-service";
import {
  normalizeImportReviewRequestState,
  requestImportReviewIfEligibleWithDependencies,
  type ImportReviewRequestState,
} from "./import-review-request-executor-service";

const importReviewRequestFileName = "import-review.json";
const showReviewAfterImportCount = 1;

const importReviewSettingsDependencies: SettingsJsonFileStoreDependencies = {
  documentDirectory: FileSystem.documentDirectory,
  getInfo: FileSystem.getInfoAsync,
  makeDirectory: FileSystem.makeDirectoryAsync,
  readAsString: FileSystem.readAsStringAsync,
  writeAsString: FileSystem.writeAsStringAsync,
};

const loadImportReviewRequestState = () =>
  loadSettingsFromJsonFileWithDependencies({
    defaultSettings: normalizeImportReviewRequestState(null),
    dependencies: importReviewSettingsDependencies,
    fileName: importReviewRequestFileName,
    normalizeSettings: normalizeImportReviewRequestState,
  });

const saveImportReviewRequestState = (settings: ImportReviewRequestState) =>
  saveSettingsToJsonFileWithDependencies({
    dependencies: importReviewSettingsDependencies,
    fileName: importReviewRequestFileName,
    normalizeSettings: normalizeImportReviewRequestState,
    settings,
  });

export const requestImportReviewIfEligible = ({
  premiumActive,
}: {
  premiumActive: boolean;
}) =>
  requestImportReviewIfEligibleWithDependencies({
    dependencies: {
      isReviewAvailable: StoreReview.isAvailableAsync,
      loadState: loadImportReviewRequestState,
      requestReview: StoreReview.requestReview,
      saveState: saveImportReviewRequestState,
    },
    options: {
      premiumActive,
      showReviewAfter: showReviewAfterImportCount,
    },
  });
