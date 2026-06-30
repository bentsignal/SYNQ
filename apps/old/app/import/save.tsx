import { useEffect, useRef } from "react";
import Progress from "@/src/components/Progress";
import { Colors } from "@/src/constants/Colors";
import CFG from "@/src/constants/Config";
import { Styles } from "@/src/constants/Styles";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { deleteImportSongs } from "@/src/features/import/lib/import-song-edits";
import { saveImportSongsToLibrary } from "@/src/features/import/lib/save-import-to-library";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { posthog } from "@/src/lib/posthog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Checkbox from "expo-checkbox";
import { router, usePathname } from "expo-router";
import * as StoreReview from "expo-store-review";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const SavePrompt = () => {
  const {
    results,
    loading,
    ip,

    setExportDisabled,
    setLoading,
    setTransferSize,
    setResults,
  } = useImportFlowContext();

  const {
    importState,
    shouldSaveToLibrary,
    importFinishRequest,
    setShouldSaveToLibrary,
  } = useImportFlowContext();

  const {
    showImportAd,
    showGlobalProgress,
    setShowGlobalProgress,
    setGlobalProgress,
    setShowImportAd,
    setShowGlobalLoading,
  } = useGlobalProgressContext();

  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();
  const { sendHaptic } = useHaptics();
  const pathname = usePathname();
  const currentPath = useRef(pathname);
  const handledImportFinishRequest = useRef(0);

  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);

  const resetResults = async () => {
    try {
      await axios.get(`http://${ip}${CFG.PORT}/reset`);
    } catch (error) {
      console.log("error resetting results: ", error);
    }
  };

  const callReview = async () => {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem("reviewAlreadyRequested", "true");
    }
  };

  const checkForReview = async () => {
    try {
      let countStr = await AsyncStorage.getItem("importCount");
      let reviewAlreadyRequested = await AsyncStorage.getItem(
        "reviewAlreadyRequested",
      );
      const requested = reviewAlreadyRequested === "true";
      if (requested) return;
      else if (premium && !requested) {
        await callReview();
      } else if (countStr) {
        let count = parseInt(countStr);
        count++;
        await AsyncStorage.setItem("importCount", count.toString());
        if (count >= CFG.showReviewAfter) {
          await callReview();
        }
      } else {
        await AsyncStorage.setItem("importCount", "1");
        let count = 1;
        if (count >= CFG.showReviewAfter) {
          await callReview();
        }
      }
    } catch (error) {
      console.log("Error requesting app store review:", error);
    }
  };

  const checkForAd = async () => {
    if (!premium && showImportAd) {
      setShowGlobalProgress(false);
      setShowGlobalLoading(true);
      setGlobalProgress(0);
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
            currentPath.current === "/import/save"
          ) {
            clearInterval(interval);
            setShowGlobalProgress(false);
            setTimeout(() => {
              setShowGlobalLoading(false);
              resolve(void 0);
            }, 1000);
          }
        }, 1000);
      });
    }
  };

  const handleImport = async () => {
    if (shouldSaveToLibrary) {
      setExportDisabled(true);
      setLoading(true);
      await checkForAd();
      const songs = premium ? results : [results[0]];
      const progress = (value: number) => {
        // TODO: Implement progress
      };
      setTimeout(() => {
        saveImportSongsToLibrary(songs, progress)
          .then(() => {
            sendHaptic("success");
            router.replace("/import/success");
            setTransferSize(0);
            setShowImportAd(false);
            setResults([]);
            if (importState === 1) {
              resetResults();
            }
            setTimeout(() => {
              checkForReview();
            }, 500);
            setTimeout(() => {
              setLoading(false);
              router.replace({
                pathname: "/(tabs)/library",
                params: {
                  category: "songs",
                  resetKey: Date.now().toString(),
                },
              });
            }, 1500);
          })
          .catch((error) => {
            setLoading(false);
            sendHaptic("error");
            router.push("/import/failure");
            setTransferSize(0);
            setShowImportAd(false);
            setResults([]);
            if (importState === 1) {
              resetResults();
            }
          });
      }, 10);
    } else {
      sendHaptic("success");
      router.push("/import/success");
      await deleteImportSongs(results);
      setResults([]);
      setTransferSize(0);
      setShowImportAd(false);
      setTimeout(() => {
        checkForReview();
      }, 500);
      setTimeout(() => {
        setLoading(false);
        router.replace("/(tabs)");
      }, 1500);
    }
  };

  useEffect(() => {
    if (importFinishRequest > handledImportFinishRequest.current) {
      handledImportFinishRequest.current = importFinishRequest;
      handleImport();
    }
  }, [importFinishRequest]);

  const toggleSave = (value: boolean) => {
    setShouldSaveToLibrary(value);
    posthog.capture("import_save_to_library", {
      value: value,
    });
  };

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
          <Checkbox
            value={shouldSaveToLibrary}
            onValueChange={toggleSave}
            color={theme}
          />
        </View>
      </View>
      <View style={[Local.body, { display: loading ? "flex" : "none" }]}>
        <Progress completion={0} loading={loading} showCircle={false} />
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

export default SavePrompt;
