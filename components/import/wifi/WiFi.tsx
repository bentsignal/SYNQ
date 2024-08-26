import { Text, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import SongList from '@/components/song/SongList';
import Loading from '@/components/Loading';
import PageTitle from '@/components/PageTitle';
import Top from '@/components/Top';
import ImportInstructions from '@/components/import/wifi/ImportInstructions';
import ImportControls from '../ImportControls';
import InfoModal from '@/components/modals/InfoModal';
import { getCompletion } from '@/lib/SongManager';
import Progress from '@/components/Progress';

const WiFi = () => {

  const {

    results, transferSize, loading,
    ip, wifiDisabled, premium,
    transferProgress, loadAnimInProgress,

    setResults, setExportDisabled, setLoading,
    setShowSaveInst, setShowInfoModal,

  } = useGlobalContext();

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
        <View
          style={[Styles.main, {
            flexGrow: 1,
            paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
          }]}
        >
          <Text style={Styles.infoText}>Failed to start server</Text>
          <Text style={[Styles.infoText, {
            marginTop: 10,
            fontWeight: 'normal',
            }]}>
              Try restarting the app
              </Text>
        </View>
      );
    }
    else if (loading || loadAnimInProgress) {
      return (
        <View
          style={[Styles.main, {
            flexGrow: 1,
            paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
          }]}
        >
          <Progress 
            completion={completion} 
            showCircle={loadAnimInProgress}
          />
        </View>
      );
    }
    else if (results.length === 0) {
      return (
        <View
          style={[Styles.main, {
            flexGrow: 1,
            paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
          }]}
        >
          <Loading height={100} width={200}/>
        </View>
      );
    }
    else if (results.length > 0) {
      return (
        <SongList songs={results} />
      );
    }
    else {
      return (
        <></>
      );
    }
  }

  const getInstructions = () => {
    if (!wifiDisabled) {
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
    <View style={[Styles.body, {paddingTop: insets.top}]}>
      <InfoModal />
      <Top />
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