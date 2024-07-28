import { Text, View, ActivityIndicator, Dimensions } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import * as server from "expo-http-server";
import * as WebBrowser from 'expo-web-browser'
import * as Network from 'expo-network';
import Constants from 'expo-constants'
import { toByteArray, fromByteArray } from 'react-native-quick-base64'
import axios from 'axios';

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import { getWifiInfo, exportSongs, idgen} from '@/lib/SongManager'
import Transfer from '@/assets/static/Transfer';
import SongList from '@/components/song/SongList'
import Loading from '@/components/Loading'
import PageTitle from '@/components/PageTitle'
import Top from '@/components/Top'
import ImportInstructions from '@/components/import/wifi/ImportInstructions'
import CustomButton from '@/components/CustomButton'

const WiFi = () => {

  const { 

    homeState, setHomeState, 
    results, setResults,
    transferSize, setTransferSize,
    serverStarted, setServerStarted,
    exportDisabled, setExportDisabled,
    loading, setLoading,
    ip, setIP,
    wifiDisabled, setWifiDisabled,
    setSelectedId

  } = useGlobalContext();

  const insets = useSafeAreaInsets();

  const [exporting, setExporting] = useState(false);
  const [URL, setURL] = useState('');
  // const [ip, setIP] = useState('0.0.0.0')
  // const [loading, setLoading] = useState(true);
  // const [disabled, setDisabled] = useState(false);
  // const [allowTransfer, setAllowTransfer] = useState(false);
  const PORT = 3000

  useEffect(() => {

    setExportDisabled(results.length > 0 ? false : true);
    setLoading(true);
    setResults([]);
    setURL(!wifiDisabled ? `http://${ip}:${PORT}` : '')

  }, [])

  const callReset = async () => {
    return await axios.get(`${URL}/reset`);
  }
  
  const resetResults = () => {
    console.log('Sending request to server to reset results')
    callReset().then((response) => {
      console.log('Server successfully reset results')
    })
    .catch((error) => {
      console.log(`ERROR: Call to reset results failed. More info: ${error} `)
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
      )
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
      )
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
      )
    }
    else if (results.length > 0) {
      return (
        <SongList songs={results} />
      )
    }
    else {
      return (
        <></>
      )
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
          handlePress={() => {
            if (!wifiDisabled) {
              WebBrowser.openBrowserAsync(URL)
            }
          }}
        />
      )
    }
  }

  return (
    <View style={[Styles.body, {paddingTop: insets.top}]}>
      <Top />
      <PageTitle title='Import Music' />
      {getInstructions()}
      {getBody()}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          position: 'absolute',
          padding: 5,
          bottom: 10
        }}
      >
        <CustomButton 
          title='Cancel'
          background={Colors.text}
          handlePress={() => {
            setHomeState(0)
            setLoading(false);
            setResults([]);
            setTransferSize(0);
            setExportDisabled(true);
            resetResults();
          }}
        />
        <CustomButton 
          title='Export'
          background={Colors.main}
          handlePress={() => {
            setExportDisabled(true);
            setLoading(true);
            setTimeout(() => {
              exportSongs(results).then(() => {
                setLoading(false);
                setHomeState(3);
                setResults([]);
                setTransferSize(0);
                setExportDisabled(true);
                resetResults();
              })
              .catch((error) => {
                console.log(error)
                console.log('failed to export files')
                setLoading(false);
                setHomeState(4);
                setResults([]);
                setTransferSize(0);
                setExportDisabled(true);
                resetResults();
              })
            }, 1000)
          }}
          disabled={exportDisabled}
        />
      </View>
    </View>
  )
}

export default WiFi;