import { Redirect } from "expo-router";

import { downloadFeature } from "~/features/download/feature";

export default function ServerRoute() {
  return downloadFeature === null ? (
    <Redirect href="/" />
  ) : (
    <downloadFeature.ServerScreen />
  );
}
