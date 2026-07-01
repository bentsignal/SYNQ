import { Colors } from "@/src/constants/Colors";
import CFG from "@/src/constants/Config";
import { Styles } from "@/src/constants/Styles";
import { PageType } from "@/src/constants/Types";
import ImportBlur from "@/src/features/import/components/Blur";
import ImportInstructions from "@/src/features/import/components/Instructions";
import Progress from "@/src/features/import/components/Progress";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useImportTransferCompletion } from "@/src/features/import/hooks/use-import-transfer-completion";
import SongList from "@/src/features/library/components/lists/song";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useImportResponsiveSpacing } from "@/src/features/import/hooks/use-import-responsive-spacing";

const ImportWifiScreen = () => {
  const {
    results,
    transferSize,
    loading,
    ip,
    wifiDisabled,
    transferProgress,
    loadAnimInProgress,
    setExportDisabled,
  } = useImportFlowContext();

  const { premium } = usePremiumContext();
  const completion = useImportTransferCompletion({
    transferProgress,
    transferSize,
  });
  const { transferBottomPadding } = useImportResponsiveSpacing();
  const url = !wifiDisabled ? ip : "";

  useEffect(() => {
    setExportDisabled(results.length === 0);
  }, [results.length, setExportDisabled]);

  const renderBody = () => {
    if (wifiDisabled) {
      return (
        <View
          style={[
            Styles.main,
            Local.container,
            { paddingBottom: transferBottomPadding },
          ]}
        >
          <Text style={Styles.infoText}>Failed to start server</Text>
          <Text style={[Styles.sub, Local.message]}>Try restarting the app</Text>
        </View>
      );
    } else if (loading || loadAnimInProgress || results.length === 0) {
      return (
        <View style={[Styles.main, Local.container, { paddingBottom: 100 }]}>
          <Progress
            completion={completion}
            loading={loading}
            showCircle={loadAnimInProgress}
          />
        </View>
      );
    } else if (results.length > 0) {
      return (
        <>
          <SongList
            songs={results}
            bottomPadding={true}
            pageType={PageType.IMPORT}
            fadeCover={false}
            fadeSong={true}
            lockScroll={!premium}
          />
          {!premium && <ImportBlur />}
        </>
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      {!wifiDisabled && results.length === 0 && transferSize <= 0 && (
        <ImportInstructions
          title="In your web browser, enter:"
          desc={`${url}${CFG.PORT === 80 ? "" : `:${CFG.PORT}`}`}
          icon={require("@/src/assets/icons/wifi.png")}
          disabled={wifiDisabled}
          handlePress={() => {}}
        />
      )}
      {renderBody()}
    </>
  );
};

const Local = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  message: {
    marginTop: 10,
    color: Colors.text,
  },
});

export default ImportWifiScreen;
