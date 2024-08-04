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
import SaveInstructionsModal from '@/components/modals/SaveInstructionsModal';

const WiFi = () => {

  const {

    results, transferSize, loading,
    ip, wifiDisabled,

    setResults, setExportDisabled, setLoading,
    setShowSaveInst

  } = useGlobalContext();

  const insets = useSafeAreaInsets();

  const [exporting, setExporting] = useState(false);
  const [URL, setURL] = useState('');
  const PORT = 3000;

  useEffect(() => {

    setExportDisabled(results.length > 0 ? false : true);
    setLoading(true);
    setResults([]);
    setURL(!wifiDisabled ? `http://${ip}:${PORT}` : '');

  }, []);

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
          <Text style={Styles.infoText}>Failed to start server.</Text>
          <Text style={[Styles.infoText, {marginTop: 10}]}>Try restarting the app.</Text>
        </View>
      );
    }
    else if (loading) {
      let message = <></>
      if (exporting) {
        message = <Text style={Styles.infoText}>Exporting your files...</Text>
      }
      else if (transferSize > 0) {
        if (transferSize === 1) {
          message = 
            <Text
              style={Styles.infoText}
            >
              Transferring {transferSize} file...
            </Text>
        }
        else {
          message = 
            <Text
              style={Styles.infoText}
            >
              Transferring {transferSize} files...
            </Text>
        }
      }
      else if (results.length == 0) {
        message = 
          <Text
            style={Styles.infoText}
          >
            Songs will appear here once uploaded
          </Text>
      }
      return (
        <View
          style={[Styles.main, {
            flexGrow: 1,
            paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
          }]}
        >
          {message}
          <Loading height={100} width={200}/>
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
          <Text
            style={Styles.infoText}
          >
            Songs will appear here once uploaded
          </Text>
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
          title='On your computer, visit:'
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
      <SaveInstructionsModal dontShowOption={false}/>
      <Top />
      <PageTitle 
        title='Import Music'
        showList={true}
        infoHandler={() => setShowSaveInst(true)}
      />
      {getInstructions()}
      {getBody()}
      <ImportControls reset={resetResults}/>
    </View>
  )
}

export default WiFi;