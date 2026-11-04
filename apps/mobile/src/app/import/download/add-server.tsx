import { Redirect } from "expo-router";

import { downloadFeature } from "~/features/download/feature";

export default function AddServerRoute() {
  return downloadFeature === null ? (
    <Redirect href="/" />
  ) : (
    <downloadFeature.AddServerScreen />
  );
}
