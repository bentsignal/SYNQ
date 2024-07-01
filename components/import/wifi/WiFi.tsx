import { Text, View, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import * as server from "expo-http-server";
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
import { transferHTML } from '@/static/Transfer';

const getIP = async () => {
  return await Network.getIpAddressAsync();
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
          }
          else {
            console.log('server state inflicted')
          }
        })
        server.route("/", "GET", async (request: server.RequestEvent) => {
          console.log("Request", "/html", "GET", request);
          // setLastCalled(Date.now());
          return {
            statusCode: 200,
            statusDescription: "OK - CUSTOM STATUS",
            contentType: "text/html",
            body: transferHTML(),
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