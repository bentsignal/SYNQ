import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import CustomButton from "@/src/shared/components/CustomButton";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ImportFailureScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={Styles.body}>
      <View style={Local.container}>
        <Text style={Local.header}>ERROR</Text>
        <Text style={Styles.infoText}>Sorry, something went wrong.</Text>
        <View style={Local.animWrapper}>
          <LottieView
            source={require("@/src/assets/anim/error.json")}
            autoPlay
            loop={false}
            style={Local.anim}
            renderMode={"SOFTWARE"}
          />
        </View>
      </View>
      <View style={[Local.buttonWrapper, { bottom: insets.bottom }]}>
        <CustomButton
          title="Back"
          background={Colors.text}
          handlePress={() => {
            router.replace("/(tabs)");
          }}
        />
      </View>
    </View>
  );
};

const Local = StyleSheet.create({
  container: {
    ...Styles.main,
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    ...Styles.h1,
    color: Colors.text,
  },
  animWrapper: {
    height: 100,
  },
  anim: {
    flexGrow: 1,
    width: 100,
  },
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    position: "absolute",
    padding: 5,
    bottom: 10,
  },
});

export default ImportFailureScreen;
