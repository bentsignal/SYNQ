import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Styles } from "@/constants/Styles";
import PageTitle from "@/components/PageTitle";
import InfoModal from "@/components/modals/InfoModal";
import ImportControls from "@/components/import/ImportControls";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";
import Checkbox from "expo-checkbox";
import { saveToLibrary } from "@/lib/SongManager";
import axios from "axios";
import Progress from "@/components/Progress";
import * as StoreReview from 'expo-store-review';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CFG from "@/constants/Config";

const SavePrompt = () => {

  const { 

    theme, premium, results,
    importState, loading,
    shouldSaveToLibrary, exportDisabled,
    showImportAd, showGlobalProgress, globalProgress,

    setExportDisabled, setLoading,
    setHomeState, setShowInfoModal,
    setTransferSize, setResults,
    setShouldSaveToLibrary, 
    setShowGlobalProgress, setGlobalProgress,
    setShowImportAd, setShowGlobalLoading,
  
  } = useGlobalContext();

  const callReset = async () => {
    return await axios.get(`${URL}/reset`);
  }
  
  const resetResults = () => {
    callReset().then((response) => {
      return null;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
  }

  const callReview = async () => {
    await StoreReview.isAvailableAsync();
    await StoreReview.requestReview();
  }

  const checkForReview = async () => {
    try {
      let countStr = await AsyncStorage.getItem('importCount');
      if (countStr) {
        let count = parseInt(countStr);
        count++;
        await AsyncStorage.setItem('importCount', count.toString());
        if (count === CFG.showReviewAfter) {
          let available = await StoreReview.isAvailableAsync();
          if (available) {
            await callReview();
          }
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
          setLoading(false);
          setHomeState(3);
          setTransferSize(0);
          setShowImportAd(false);
          setResults([]);
          if (importState === 1) {
            resetResults();
          }
          setTimeout(() => {
            checkForReview();
          }, 1500);
        })
        .catch((error) => {
          setLoading(false);
          setHomeState(4);
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
      setHomeState(3);
      setResults([]);
      setTransferSize(0);
      setShowImportAd(false);
      setLoading(false);
    }
  }

  return (
    <View style={Styles.body}>
      <InfoModal />
      <PageTitle 
        title='Save Music'
        infoHandler={() => setShowInfoModal(true)}
        showList={false}
      />
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
      <ImportControls 
        altTitle='Back'
        mainTitle='Finish'
        altHandle={() => setHomeState(5)}
        mainHandle={handleImport}
        altDisabled={exportDisabled}
        mainDisabled={exportDisabled}
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