import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { darkenColor } from "@/src/lib/color-utils";
import { replaceColor } from "lottie-colorify";
import LottieView from "lottie-react-native";
import { StyleSheet, View } from "react-native";

const IngestSuccessScreen = () => {
  const { theme } = useThemeContext();

  let source = replaceColor(
    "#4173b9",
    darkenColor(theme, 10, 20),
    require("@/src/assets/anim/success.json"),
  );
  source = replaceColor("#63a3ff", theme, source);

  return (
    <View style={Local.container}>
      <LottieView
        source={source}
        autoPlay
        loop={false}
        style={{ flexGrow: 1, width: 100 }}
        renderMode={"SOFTWARE"}
      />
    </View>
  );
};

const Local = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100,
  },
});

export default IngestSuccessScreen;
