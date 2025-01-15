import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useState } from "react";
import { Styles } from "@/constants/Styles";
import PageTitle from "@/components/PageTitle";
import InfoModal from "@/components/modals/InfoModal";
import ImportControls from "@/components/import/ImportControls";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import CustomButton from "@/components/CustomButton";
import { Colors } from "@/constants/Colors";
import { exportSongs } from '@/lib/controllers/ImportExportController';
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import SettingsButton from "../SettingsButton";

const ExportPrompt = () => {

  const { 
    
    importState, results,
    showImportAd, showGlobalProgress,
  
    setHomeState, setShowInfoModal,
    setShowGlobalLoading, 
    setShowGlobalProgress,
    setGlobalProgress,
    setShowImportAd,
    setLoading,

  } = useGlobalContext();

  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();

  const [disabled, setDisabled] = useState(false);

  const checkForAd = async () => {
    console.log(!premium, showImportAd);
    if (!premium && showImportAd) {
      await new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
          if (progress < 100) {
            if (progress >= 5 && !showGlobalProgress) {
              setShowGlobalProgress(true);
            }
            progress += 5;
            setGlobalProgress(progress);
          }
          if (progress >= 100) {
            clearInterval(interval);
            setShowGlobalProgress(false);
            setTimeout(() => {
              resolve(void 0);
            }, 1000);
          }
        }, 1000);
      });
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
    setHomeState(importState);
    setLoading(false);
  }

  const handleNext = () => {
    setHomeState(6);
  }

  return (
    <View style={Styles.body}>
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