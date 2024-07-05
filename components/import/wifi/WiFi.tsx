import { Text, View, ActivityIndicator, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import * as server from "expo-http-server";
import * as WebBrowser from 'expo-web-browser'
import * as Network from 'expo-network';
import Constants from 'expo-constants'
import { toByteArray, fromByteArray } from 'react-native-quick-base64'

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

const getIP = async () => {
  return await Network.getIpAddressAsync();
}

const WiFi = () => {

  const { 

    homeState, setHomeState, 
    results, setResults,
    setSelectedId

  } = useGlobalContext();

  const [ip, setIP] = useState('0.0.0.0')
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [transferSize, setTransferSize] = useState(0);
  const [exportDisabled, setExportDisabled] = useState(results.length > 0 ? false : true);
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
            body: Transfer(),
          };
        });
        server.route('/startTransfer', 'POST', async (request: server.RequestEvent) => {
          const body = JSON.parse(request.body);
          const size = body.size ? body.size : 0;
          setTransferSize(size);
          return ({
            statusCode: 200,
            statusDescription: "OK - READY TO TRANSFER"
          })
        })
        server.route("/fileUpload", "POST", async (request: server.RequestEvent) => {
          const body = JSON.parse(request.body)
          const name = body.name ? body.name : ''
          const type = body.type ? body.type : ''
          const buffer = body.data ? new Uint8Array(body.data) : new Uint8Array();
          console.log(buffer)
          const b64 = fromByteArray(buffer);
          console.log(b64);
          if (name && type == 'audio/mpeg' && b64) {
            const id = idgen(10);
            const info = await getWifiInfo(name, id, type, b64)
            if (info) {
              const newResults = results;
              results.push({
                'name': name,
                'id': id,
                'data': b64,
                'info': info
              })
              setResults(newResults);
              setSelectedId(id);
            }
            setLoading(false);
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
    else if (loading) {
      let message = <></>
      if (transferSize > 0) {
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
            setLoading(false);
            setResults([]);
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
              })
              .catch((error) => {
                console.log(error)
                console.log('failed to export files')
                setLoading(false);
                setHomeState(4);
                setResults([]);
              })
            }, 1000)
            // server.stop() seems to be the cause of the app crashing
          }}
          disabled={exportDisabled}
        />
      </View>
    </SafeAreaView>
  )
}

export default WiFi;