import CustomButton from "@/src/shared/components/CustomButton";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useImportExportFlow } from "@/src/features/import/hooks/use-import-export-flow";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const ExportPrompt = () => {
  const { disabled, handleExport, theme } = useImportExportFlow();

  return (
    <>
      <View style={Local.body}>
        <Text style={Local.prompt}>Export your edited songs?</Text>
        <Text style={Local.info}>
          To learn how to export your songs to Spotify, click the info icon at
          the top of the page.
        </Text>
        <CustomButton
          title="Export"
          background={theme}
          customStyles={Local.button}
          buttonWidth="40%"
          disabled={disabled}
          handlePress={handleExport}
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
  button: {
    marginVertical: 10,
  },
});

export default ExportPrompt;
