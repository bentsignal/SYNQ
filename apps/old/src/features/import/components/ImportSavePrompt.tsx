import Progress from "@/src/features/import/components/Progress";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useImportSaveFlow } from "@/src/features/import/hooks/use-import-save-flow";
import ExpoCheckbox from "expo-checkbox";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const ImportSavePrompt = () => {
  const { loading, saveCompletion, shouldSaveToLibrary, theme, toggleSave } =
    useImportSaveFlow();

  return (
    <>
      <View style={[Local.body, { display: loading ? "none" : "flex" }]}>
        <Text style={Local.prompt}>Save to SYNQ library?</Text>
        <Text style={Local.info}>
          If you want to listen to your music in SYNQ, check the box below. Your
          music will then be saved to your SYNQ library.
        </Text>
        <View style={Local.checkboxContainer}>
          <Text style={Local.checkboxText}>Save to library</Text>
          <ExpoCheckbox
            value={shouldSaveToLibrary}
            onValueChange={toggleSave}
            color={theme}
          />
        </View>
      </View>
      <View style={[Local.body, { display: loading ? "flex" : "none" }]}>
        <Progress
          completion={saveCompletion}
          loading={loading}
          showCircle={false}
        />
      </View>
    </>
  );
};

const Local = StyleSheet.create({
  body: {
    ...Styles.main,
    width: "90%",
    marginBottom: Dimensions.get("screen").height < 700 ? 100 : 80,
  },
  prompt: {
    ...Styles.h3,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  info: {
    ...Styles.p,
    color: Colors.infoText,
    textAlign: "center",
    marginBottom: 10,
  },
  checkboxText: {
    ...Styles.h5,
    color: Colors.text,
  },
  checkboxContainer: {
    flexDirection: "row",
    gap: 10,
  },
});

export default ImportSavePrompt;
