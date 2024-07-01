import { Text, View, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import * as server from "expo-http-server";
import { Asset } from 'expo-asset'
import { readAsStringAsync } from 'expo-file-system';
import * as Network from 'expo-network';
import Constants from 'expo-constants'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import PageTitle from '@/components/PageTitle'
import Top from '@/components/Top'
import ImportOption from '@/components/Option'
import ImportInstructions from '@/components/import/wifi/ImportInstructions'
import CustomButton from '@/components/CustomButton'

const getIP = async () => {
  return await Network.getIpAddressAsync();
}

const readTransferHTML = async () => {
  const [{ localUri }] = await Asset.loadAsync(require('@/constants/Transfer.html'))
  if (localUri) {
    return await readAsStringAsync(localUri);
  }
}

const WiFi = () => {

  const { homeState, setHomeState } = useGlobalContext();
  const [ip, setIP] = useState('0.0.0.0')
  const PORT = 3000

  useEffect(() => {
    if (Constants.appOwnership !== 'expo') {
      getIP().then((value) => {
        setIP(value)
      })
      try {
        server.setup(PORT, (event: server.StatusEvent) => {
          if (event.status == 'ERROR') {
            console.log('server error')
            setHomeState(4);
          }
          else {
            console.log('server state inflicted')
          }
        })
        server.route("/", "GET", async (request: server.RequestEvent) => {
          console.log("Request", "/html", "GET", request);
          let html;
          try {
            html = await readTransferHTML();
          }
          catch {
            html = '<html><p>ERROR: Could not load server<p></html'
          }
          return {
            statusCode: 200,
            statusDescription: "OK - CUSTOM STATUS",
            contentType: "text/html",
            body: html,
          };
        });
        server.start();
        return () => {
          server.stop();
        };
      }
      catch (error) {
        console.log(`ERROR: Couldn't run server: ${error}`)
        setHomeState(4);
      }
    }
  }, [])

  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Import Music' />
      <ImportInstructions
        title='On your computer, visit:'
        desc={`http://${ip}:${PORT}`}
        icon={require('@/assets/icons/wifi.png')}
        handlePress={() => {}}
      />
      <View
        style={{
          alignSelf: 'stretch',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60%',
          marginBottom: 10
        }}
      >
        <Text
          style={Styles.infoText}
        >
          songs will appear here once uploaded
        </Text>
        <ActivityIndicator style={{
          padding: 20
        }}/>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10
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