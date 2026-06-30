import Ad from "./Ad";
import Overlay from "./Overlay";
import Progress from "./Progress";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { StyleSheet, Text, View } from "react-native";

const GlobalProgress = () => {
  const {
    globalProgress,
    showGlobalLoading,
    showImportAd,
    showGlobalProgress,
  } = useGlobalProgressContext();

  const { theme } = useThemeContext();

  const Local = StyleSheet.create({
    container: {
      display: showGlobalLoading ? "flex" : "none",
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1000,
    },
  });

  const getAdMessage = () => {
    return (
      <Text>
        Import multiple files at once, and remove all ads with{" "}
        <Text style={{ color: theme }}>Premium</Text>
      </Text>
    );
  };

  return (
    <View style={Local.container}>
      <Progress
        completion={globalProgress}
        loading={showGlobalLoading}
        showCircle={showGlobalProgress}
        linear={true}
      />
      {showImportAd && <Ad message={getAdMessage()} />}
      <Overlay show={showGlobalLoading} activeOpacity={0.9} />
    </View>
  );
};

export default GlobalProgress;
