import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  offset?: number;
};

export const TopInset = ({ offset = 10 }: Props) => {
  const insets = useSafeAreaInsets();
  return <View style={{ width: "100%", height: insets.top + offset }} />;
};

export const BottomInset = ({ offset = 10 }: Props) => {
  const insets = useSafeAreaInsets();
  return <View style={{ width: "100%", height: insets.bottom + offset }} />;
};
