import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Top() {
  const insets = useSafeAreaInsets();

  return <View style={{ marginTop: insets.top + 10 }} />;
}
