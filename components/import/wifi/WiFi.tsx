import { Text, View, Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import SongList from '@/components/song/SongList';
import PageTitle from '@/components/PageTitle';
import Top from '@/components/Top';
import ImportInstructions from '@/components/import/wifi/ImportInstructions';
import ImportControls from '../ImportControls';
import InfoModal from '@/components/modals/InfoModal';
import { getCompletion } from '@/lib/SongManager';
import { Colors } from '@/constants/Colors';
import Progress from '@/components/Progress';
import { PageType } from '@/constants/Types';

const WiFi = () => {

  const {

    results, transferSize, loading,
    ip, wifiDisabled, premium,
    transferProgress, loadAnimInProgress,

    setResults, setExportDisabled, setLoading,
    setShowSaveInst, setShowInfoModal,

  } = useGlobalContext();

  const Local = StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
    },
    message: {
      marginTop: 10,
      color: Colors.text
    }
  });

  const insets = useSafeAreaInsets();

  const [exporting, setExporting] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [URL, setURL] = useState('');
  const PORT = 80;

  useEffect(() => {

    setExportDisabled(results.length > 0 ? false : true);
    setLoading(true);
    setResults([]);
    setURL(!wifiDisabled ? `${ip}` : '');

  }, []);

  useEffect(() => {
    if (transferSize > 0 && transferProgress >= 0) {
      setCompletion(((transferProgress / transferSize) * 100));
    }
  }, [transferProgress]);

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
    })
  }

  const getBody = () => {
    if (wifiDisabled) {
      return (
        <View style={[Styles.main, Local.container]}>
          <Text style={Styles.infoText}>
            Failed to start server
          </Text>
          <Text style={[Styles.sub, Local.message]}>
            Try restarting the app
          </Text>
        </View>
      );
    }
    else if (loading || loadAnimInProgress || results.length === 0) {
      return (
        <View style={[Styles.main, Local.container]}>
          <Progress 
            completion={completion} 
            loading={loading}
            showCircle={loadAnimInProgress}
          />
        </View>
      );
    }
    else if (results.length > 0) {
      return (
        <SongList
          songs={results}
          bottomPadding={true}
          pageType={PageType.IMPORT}
          fadeCover={false}
          fadeSong={true}
        />
      );
    }
    else {
      return (
        <></>
      );
    }
  }

  const getInstructions = () => {
    if (!wifiDisabled && results.length === 0 && transferSize <= 0) {
      return (
        <ImportInstructions
          title='In your web browser, enter:'
          desc={URL}
          icon={require('@/assets/icons/wifi.png')}
          disabled={wifiDisabled}
          handlePress={() => {}}
        />
      );
    }
  }

  return (
    <View style={Styles.body}>
      <InfoModal />
      <PageTitle 
        title='Import Music'
        showList={results.length > 1 && premium && !loadAnimInProgress}
        infoHandler={() => setShowInfoModal(true)}
      />
      {getInstructions()}
      {getBody()}
      <ImportControls reset={resetResults}/>
    </View>
  )
}

export default WiFi;