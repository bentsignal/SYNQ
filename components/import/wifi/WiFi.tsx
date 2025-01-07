import { Text, View, Dimensions, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import SongList from '@/components/lists/song';
import PageTitle from '@/components/PageTitle';
import ImportInstructions from '@/components/import/wifi/ImportInstructions';
import ImportControls from '../ImportControls';
import InfoModal from '@/components/modals/InfoModal';
import { Colors } from '@/constants/Colors';
import Progress from '@/components/Progress';
import { PageType } from '@/constants/Types';
import { usePremiumContext } from '@/context/PremiumProvider';
import CFG from '@/constants/Config';

const WiFi = () => {

  const {

    results, transferSize, loading,
    ip, wifiDisabled,
    transferProgress, loadAnimInProgress,
    homeState, exportDisabled,

    setResults, setExportDisabled, setLoading,
    setShowInfoModal,
    setImportState, setHomeState,
    setTransferSize,

  } = useGlobalContext();

  const { premium } = usePremiumContext();

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

  const [completion, setCompletion] = useState(0);
  const [URL, setURL] = useState('');

  useEffect(() => {

    setExportDisabled(results.length > 0 ? false : true);
    setURL(!wifiDisabled ? `${ip}` : '');

  }, []);

  useEffect(() => {
    if (transferSize > 0 && transferProgress >= 0) {
      setCompletion(((transferProgress / transferSize) * 100));
    }
  }, [transferProgress]);

  const callReset = async () => {
    const resetEndpoint = `http://${URL}${CFG.PORT === 80 ? '' : `:${CFG.PORT}`}`;
    return await axios.get(`${resetEndpoint}/reset`);
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

  const handleCancel = () => {
    setLoading(false);
    setTransferSize(0);
    setHomeState(0);
    setResults([]);
    setExportDisabled(true);
    resetResults();
  }

  const handleNext = () => {
    setImportState(homeState);
    setHomeState(5);
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
          desc={`${URL}${CFG.PORT === 80 ? '' : `:${CFG.PORT}`}`}
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
        showList={false &&results.length > 1 && premium && !loadAnimInProgress}
        infoHandler={() => setShowInfoModal(true)}
      />
      {getInstructions()}
      {getBody()}
      <ImportControls
        altTitle='Cancel'
        mainTitle='Next'
        altHandle={handleCancel}
        mainHandle={handleNext}
        altDisabled={transferSize > 0}
        mainDisabled={exportDisabled}
      />
    </View>
  )
}

export default WiFi;