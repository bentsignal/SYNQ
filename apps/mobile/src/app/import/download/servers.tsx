import { Redirect } from "expo-router";

import { downloadFeature } from "~/features/download/feature";

export default function ServersRoute() {
  return downloadFeature === null ? (
    <Redirect href="/" />
  ) : (
    <downloadFeature.ServersScreen />
  );
}
