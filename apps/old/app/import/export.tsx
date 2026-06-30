import { useEffect, useRef, useState } from "react";
import CustomButton from "@/src/components/CustomButton";
import PageTitle from "@/src/components/PageTitle";
import SettingsButton from "@/src/components/SettingsButton";
import { Colors } from "@/src/constants/Colors";
import CFG from "@/src/constants/Config";
import { Styles } from "@/src/constants/Styles";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { exportSongs } from "@/src/features/export/lib/export-songs";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { posthog } from "@/src/lib/posthog";
import { usePathname } from "expo-router";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ExportPrompt = () => {
  const { results } = useImportFlowContext();

  const {
    showImportAd,
    showGlobalProgress,
    setShowGlobalLoading,
    setShowGlobalProgress,
    setGlobalProgress,
    setShowImportAd,
  } = useGlobalProgressContext();

  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const currentPath = useRef(pathname);

  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);

  const [disabled, setDisabled] = useState(false);

  const checkForAd = async () => {
    if (!premium && showImportAd) {
      await new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          if (progress < CFG.importAdLength) {
            if (progress >= 1 && !showGlobalProgress) {
              setShowGlobalProgress(true);
            }
            progress += 1;
            setGlobalProgress(Math.ceil((progress / CFG.importAdLength) * 100));
          } else if (
            progress >= CFG.importAdLength &&
            currentPath.current === "/import/export"
          ) {
            clearInterval(interval);
            setShowGlobalProgress(false);
            setTimeout(() => {
              resolve(void 0);
            }, 1000);
          }
        }, 1000);
      });
    } else {
      setShowImportAd(false);
    }
  };

  const handleExport = async () => {
    try {
      posthog.capture("export_during_import");
      setDisabled(true);
      setShowGlobalLoading(true);
      setShowGlobalProgress(false);
      setGlobalProgress(0);
      const songs = premium ? results : [results[0]];
      await checkForAd();
      await exportSongs(songs);
      setShowGlobalLoading(false);
      setDisabled(false);
      setShowImportAd(false);
    } catch (error) {
      setShowGlobalLoading(false);
      setDisabled(false);
      console.log("Error exporting songs: ", error);
    }
  };

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
