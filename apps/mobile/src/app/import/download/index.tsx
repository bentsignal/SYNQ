import { Redirect } from "expo-router";

import { downloadFeature } from "~/features/download/feature";

export default function DownloadRoute() {
  return downloadFeature === null ? (
    <Redirect href="/" />
  ) : (
    <downloadFeature.DownloadScreen />
  );
}
