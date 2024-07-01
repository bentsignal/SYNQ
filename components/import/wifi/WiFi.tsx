import { Text, View, ActivityIndicator, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
// import * as server from "expo-http-server";
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import * as Network from 'expo-network';
import Constants from 'expo-constants'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import { SongList } from '@/components/song/SongList'
import PageTitle from '@/components/PageTitle'
import Top from '@/components/Top'
import ImportInstructions from '@/components/import/wifi/ImportInstructions'
import CustomButton from '@/components/CustomButton'
import { Transfer } from '@/components/import/wifi/Transfer';

const getIP = async () => {
  return await Network.getIpAddressAsync();
}

const WiFi = () => {

  const { homeState, setHomeState, fileResults, setFileResults } = useGlobalContext();
  const [ip, setIP] = useState('0.0.0.0')
  const [disabled, setDisabled] = useState(false);
  const PORT = 3000

  useEffect(() => {
    if (Constants.appOwnership !== 'expo') {
      getIP().then((value) => {
        setIP(value)
      })
      .catch((error) => {
        setHomeState(4);
      })
      try {
        server.setup(PORT, (event: server.StatusEvent) => {
          if (event.status == 'ERROR') {
            console.log('server error')
            setDisabled(false);
          }
          else {
            console.log('server state inflicted')
            setDisabled(false);
          }
        })
        server.route("/", "GET", async (request: server.RequestEvent) => {
          return {
            statusCode: 200,
            statusDescription: "OK - CUSTOM STATUS",
            contentType: "text/html",
            body: Transfer(),
          };
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
    else {
      setDisabled(true);
    }
  }, [])

  const getBody = () => {
    if (disabled) {
      return (
        <View
          style={[Styles.main, {
            paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
          }]}
        >
          <Text style={Styles.infoText}>Failed to start server</Text>
        </View>
      )
    }
    else if (fileResults.length > 0) {
      return (
        <SongList songs={fileResults} />
      )
    }
    else {
      return (
        <View
          style={[Styles.main, {
            paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
          }]}
        >
          <Text
            style={Styles.infoText}
          >
            Songs will appear here once uploaded
          </Text>
          <ActivityIndicator style={{
            padding: 20
          }}/>
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
          handlePress={() => setHomeState(0)}
        />
        <CustomButton 
          title='Import'
          background={Colors.main}
          handlePress={() => {
            router.replace('/library');
            setHomeState(0);
          }}
          disabled={true}
        />
      </View>
    </SafeAreaView>
  )
}

export default WiFi;