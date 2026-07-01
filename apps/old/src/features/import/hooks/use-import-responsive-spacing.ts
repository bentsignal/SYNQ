import { useWindowDimensions } from "react-native";

const COMPACT_SCREEN_HEIGHT = 700;

export const useImportResponsiveSpacing = () => {
  const { height } = useWindowDimensions();
  const compact = height < COMPACT_SCREEN_HEIGHT;

  return {
    promptBottomMargin: compact ? 100 : 80,
    transferBottomPadding: compact ? 70 : 50,
  };
};
