// Metro resolves audio imports to asset module ids (for expo-asset).
declare module "*.mp3" {
  const asset: number;
  export default asset;
}

// Metro resolves image imports to asset sources.
declare module "*.png" {
  import type { ImageSourcePropType } from "react-native";

  const source: ImageSourcePropType;
  export default source;
}
