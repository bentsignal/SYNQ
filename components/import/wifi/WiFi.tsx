import { Text, View, ActivityIndicator, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import * as server from "expo-http-server";
import * as WebBrowser from 'expo-web-browser'
import * as Network from 'expo-network';
import Constants from 'expo-constants'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import { getWifiInfo, exportSongs } from '@/lib/SongManager'
import SongList from '@/components/song/SongList'
import Loading from '@/components/Loading'
import PageTitle from '@/components/PageTitle'
import Top from '@/components/Top'
import ImportInstructions from '@/components/import/wifi/ImportInstructions'
import CustomButton from '@/components/CustomButton'

const getIP = async () => {
  return await Network.getIpAddressAsync();
}

const WiFi = () => {

  const { homeState, setHomeState, wifiResults, setWifiResults, transferPage } = useGlobalContext();
  const [ip, setIP] = useState('0.0.0.0')
  const [disabled, setDisabled] = useState(false);
  const [exportDisabled, setExportDisabled] = useState(wifiResults.length > 0 ? false : true);
  const PORT = 3000

  useEffect(() => {

    const startServer = async () => {
      try {
        setIP(await getIP());
      }
      catch {
        setHomeState(4);
      }
      try {
        server.setup(PORT, (event: server.StatusEvent) => {
          if (event.status == 'ERROR') {
            console.log('server error')
            setDisabled(true);
          }
          else {
            setDisabled(false);
          }
        })
        server.route("/", "GET", async (request: server.RequestEvent) => {
          return {
            statusCode: 200,
            statusDescription: "OK",
            contentType: "text/html",
            body: transferPage,
          };
        });
        server.route("/fileUpload", "POST", async (request: server.RequestEvent) => {
          const body = JSON.parse(request.body)
          const name = body.name ? body.name : ''
          const type = body.type ? body.type : ''
          const data = body.data ? body.data : ''
          if (name && type && data) {
            const info = await getWifiInfo(name, type, data)
            const results = wifiResults;
            results.push({
              'name': name,
              'uri': 'wifi',
              'data': data,
              'info': info
            })
            setWifiResults(results);
            setExportDisabled(false);
          }
          return {
            statusCode: 200,
            statusDescription: "OK - FILE RECEIVED",
          }
        });
        server.start();
        return () => {
          server.stop();
        };
      }
      catch (error) {
        console.log(`ERROR: Couldn't run server: ${error}`)
        setDisabled(true);
      }
    }

    if (Constants.appOwnership !== 'expo') {
      startServer();
    }
    else {
      setDisabled(true);
    }

  }, [])

  const getBody = () => {
    if (disabled) {
      return (
        <View
          style={[Styles.main, {
            flexGrow: 1,
            paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
          }]}
        >
          <Text style={Styles.infoText}>Failed to start server</Text>
        </View>
      )
    }
    else if (wifiResults.length > 0) {
      return (
        <SongList songs={wifiResults} />
      )
    }
    else {
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
          {/* <ActivityIndicator style={{
            padding: 20
          }}/> */}
        </View>
      )
    }
  }

  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Import Music' />
      <ImportInstructions
        title='On your computer, visit:'
        desc={`http://${ip}:${PORT}`}
        icon={require('@/assets/icons/wifi.png')}
        disabled={disabled}
        handlePress={() => {
          if (!disabled) {
            WebBrowser.openBrowserAsync(`http://${ip}:${PORT}`)
          }
        }}
      />
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
            setWifiResults([]);
            server.stop();
          }}
        />
        <CustomButton 
          title='Export'
          background={Colors.main}
          handlePress={() => {
            setExportDisabled(true);
            setLoading(true);
            setZipping(true);
            setTimeout(() => {
              exportSongs(wifiResults).then(() => {
                setLoading(false);
                setZipping(false);
                // router.replace('/library');
                setHomeState(3);
                setWifiResults([]);
              })
              .catch((error) => {
                console.log(error)
                console.log('failed to export files')
                setLoading(false);
                setZipping(false);
                setHomeState(4);
                setWifiResults([]);
              })
            }, 1000)
            server.stop()
          }}
          disabled={exportDisabled}
        />
      </View>
    </SafeAreaView>
  )
}

export default WiFi;