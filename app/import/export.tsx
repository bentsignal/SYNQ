import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useState, useEffect, useRef } from "react";
import { Styles } from "@/src/constants/Styles";
import PageTitle from "@/src/components/PageTitle";
import InfoModal from "@/src/components/modals/InfoModal";
import ImportControls from "@/src/components/import/Controls";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import CustomButton from "@/src/components/CustomButton";
import { Colors } from "@/src/constants/Colors";
import { exportSongs } from '@/src/controllers/ImportExportController';
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import SettingsButton from "@/src/components/SettingsButton";
import CFG from "@/src/constants/Config";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const ExportPrompt = () => {

  const pathname = usePathname();
  const currentPath = useRef(pathname);

  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);

  const { 
    
    importState, results,
    showImportAd, showGlobalProgress,
  
    setShowInfoModal,
    setShowGlobalLoading, 
    setShowGlobalProgress,
    setGlobalProgress,
    setShowImportAd,
    setLoading,

  } = useGlobalContext();

  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();

  const [disabled, setDisabled] = useState(false);

  const checkForAd = async () => {
    if (!premium && showImportAd) {
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
          else if (progress >= CFG.importAdLength && currentPath.current === '/import/export') {
            clearInterval(interval);
            setShowGlobalProgress(false);
            setTimeout(() => {
              resolve(void 0);
            }, 1000);
          }
        }, 1000);
      });
    }
    else {
      setShowImportAd(false);
    }
  }

  const handleExport = async () => {
    try {
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
    }
    catch (error) {
      setShowGlobalLoading(false);
      setDisabled(false);
      console.log('Error exporting songs: ', error);
    }
  }

  const handleBack = () => {
    router.back();
    setLoading(false);
  }

  const handleNext = () => {
    router.push('/import/save');
  }

  return (
    <View style={[Styles.body, { paddingTop: insets.top + 10 }]}>
      <InfoModal />
      <PageTitle 
        title='Export Music'
        infoHandler={() => setShowInfoModal(true)}
        showList={false}
        rightHandComponent={<SettingsButton />}
      />
      <View style={Local.body}>
        <Text style={Local.prompt}>
          Export your edited songs?
        </Text>
        <Text style={Local.info}>
          To learn how to export your songs to Spotify, click the info icon at the top of the page.
        </Text>
        <CustomButton
          title='Export'
          background={theme}
          customStyles={Local.button}
          buttonWidth='40%'
          disabled={disabled}
          handlePress={handleExport}
        />
      </View>
      <ImportControls 
        altTitle='Back'
        mainTitle='Next'
        altHandle={handleBack}
        mainHandle={handleNext}
        altDisabled={disabled}
        mainDisabled={disabled}
      />
    </View>
  );
}

const Local = StyleSheet.create({
  body: {
    ...Styles.main,
    width: '90%',
    marginBottom: Dimensions.get('screen').height < 700 ? 70 : 50,
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
  button: {
    marginVertical: 10,
  }
});

export default ExportPrompt;