import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useRef, useEffect } from "react";
import { router, usePathname } from "expo-router";
import { Styles } from "@/src/constants/Styles";
import PageTitle from "@/src/components/PageTitle";
import InfoModal from "@/src/components/modals/InfoModal";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { Colors } from "@/src/constants/Colors";
import Checkbox from "expo-checkbox";
import { saveToLibrary } from "@/src/controllers/LibraryController";
import axios from "axios";
import Progress from "@/src/components/Progress";
import * as StoreReview from 'expo-store-review';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CFG from "@/src/constants/Config";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import playlistBus from "@/src/events/playlist";
import { deleteImportSongs } from "@/src/controllers/ImportExportController";
import SettingsButton from "@/src/components/SettingsButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import importBus from "@/src/events/import";
import { ImportBusEvent } from "@/src/events/import/Events";

const SavePrompt = () => {

  const pathname = usePathname();
  const currentPath = useRef(pathname);

  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);

  const { 

    results,
    importState, loading,
    shouldSaveToLibrary,
    showImportAd, showGlobalProgress,
    ip, 

    setExportDisabled, setLoading,
    setShowInfoModal,
    setTransferSize, setResults,
    setShouldSaveToLibrary, 
    setShowGlobalProgress, setGlobalProgress,
    setShowImportAd, setShowGlobalLoading,
  
  } = useGlobalContext();

  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();
  const insets = useSafeAreaInsets();
  
  const resetResults = async () => {
    try {
      await axios.get(`http://${ip}${CFG.PORT}/reset`);
    } catch (error) {
      console.log('error resetting results: ', error);
    }
  }

  const callReview = async () => {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem('reviewAlreadyRequested', 'true');
    }
  }

  const checkForReview = async () => {
    try {
      let countStr = await AsyncStorage.getItem('importCount');
      let reviewAlreadyRequested = await AsyncStorage.getItem('reviewAlreadyRequested');
      const requested = reviewAlreadyRequested === 'true';
      if (requested) return;
      else if (premium && !requested) {
        await callReview();
      }
      else if (countStr) {
        let count = parseInt(countStr);
        count++;
        await AsyncStorage.setItem('importCount', count.toString());
        if (count >= CFG.showReviewAfter) {
          await callReview();
        }
      }
      else {
        await AsyncStorage.setItem('importCount', '1');
      }
    }
    catch (error) {
      console.log('Error requesting app store review:', error);
    }
  }

  const checkForAd = async () => {
    if (!premium && showImportAd) {
      setShowGlobalProgress(false);
      setShowGlobalLoading(true);
      setGlobalProgress(0);
      await new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
          if (progress < CFG.importAdLength) {
            if (progress >= 1 && !showGlobalProgress) {
              setShowGlobalProgress(true);
            }
            progress += 1;
            setGlobalProgress(Math.ceil(progress / CFG.importAdLength * 100));
          }
          else if (progress >= CFG.importAdLength && currentPath.current === '/import/save') {
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
  }

  const handleImport = async () => {
    if (shouldSaveToLibrary) {
      setExportDisabled(true);
      setLoading(true);
      await checkForAd();
      const songs = premium ? results : [results[0]]
      const progress = (value: number) => {
        // TODO: Implement progress
      } 
      setTimeout(() => {
        saveToLibrary(songs, progress).then(() => {
          playlistBus.emit(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED);
          router.replace('/import/success');
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
            router.replace('/(tabs)/library');
          }, 1500);
        })
        .catch((error) => {
          setLoading(false);
          router.push('/import/failure');
          setTransferSize(0);
          setShowImportAd(false);
          setResults([]);
          if (importState === 1) {
            resetResults();
          }
        })
      }, 10);
    }
    else {
      router.push('/import/success');
      await deleteImportSongs(results);
      setResults([]);
      setTransferSize(0);
      setShowImportAd(false);
      setTimeout(() => {
        checkForReview();
      }, 500);
      setTimeout(() => {
        setLoading(false);
        router.replace('/(tabs)');
      }, 1500);
    }
  }

  useEffect(() => {
    importBus.on(ImportBusEvent.TRIGGER_FINISH, handleImport);
    return () => {
      importBus.off(ImportBusEvent.TRIGGER_FINISH, handleImport);
    };
  }, [handleImport]);

  return (
    <>
      <View style={[Local.body, {display: loading ? 'none' : 'flex'}]}>
        <Text style={Local.prompt}>
          Save to SYNQ library?
        </Text>
        <Text style={Local.info}>
          If you want to listen to your music in SYNQ, check the box below. Your music
          will then be saved to your SYNQ library.
        </Text>
        <View style={Local.checkboxContainer}>
          <Text style={Local.checkboxText}>Save to library</Text>
          <Checkbox
            value={shouldSaveToLibrary}
            onValueChange={setShouldSaveToLibrary}
            color={theme}
          />
        </View>
      </View>
      <View style={[Local.body, {display: loading ? 'flex' : 'none'}]}>
        <Progress 
          completion={0}
          loading={loading}
          showCircle={false}
        />
      </View>
    </>
  );
}

const Local = StyleSheet.create({
  body: {
    ...Styles.main,
    width: '90%',
    marginBottom: Dimensions.get('screen').height < 700 ? 100 : 80,
  },
  prompt: {
    ...Styles.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  info: {
    ...Styles.p,
    color: Colors.infoText,
    textAlign: 'center',
    marginBottom: 10,
  },
  checkboxText: {
    ...Styles.h5,
    color: Colors.text,
  },
  checkboxContainer: {
    flexDirection: 'row',
    gap: 10,
  }
});

export default SavePrompt;