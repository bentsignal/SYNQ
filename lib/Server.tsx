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

const Server = () => {

  const { 

    homeState, setHomeState, 
    results, setResults,
    transferSize, setTransferSize,
    serverStarted, setServerStarted,
    exportDisabled, setExportDisabled,
    wifiDisabled, setWifiDisabled,
    loading, setLoading,
    ip, setIP,
    setSelectedId

  } = useGlobalContext();
  const PORT = 3000;

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
            setWifiDisabled(true);
          }
          else {
            setWifiDisabled(false);
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
          console.log('Received request to begin transfer')
          const body = JSON.parse(request.body);
          const size = body.size ? body.size : 0;
          setTransferSize(Number(size));
          setLoading(true);
          setExportDisabled(true);
          return ({
            statusCode: 200,
            statusDescription: "OK - READY TO TRANSFER"
          })
        })
        server.route('/finishTransfer', 'POST', async (request: server.RequestEvent) => {
          console.log('Received request to finish transfer')
          setLoading(false);
          setExportDisabled(false);
          setTransferSize(0);
          return ({
            statusCode: 200,
            statusDescription: "OK - FINISHED TRANSFER"
          })
        })
        server.route("/fileUpload", "POST", async (request: server.RequestEvent) => {
          console.log('\n\nReceieved fileUpload request')
          const body = JSON.parse(request.body)
          const name = body.name ? body.name : ''
          const type = body.type ? body.type : ''
          const b64 = body.data ? body.data : ''
          if (name && type == 'audio/mpeg' && b64) {
            console.log(`Attempting to retrieve metadata from ${name}`)
            const id = idgen(10);
            const info = await getWifiInfo(name, id, type, b64)
            if (info) {
              console.log(`Successfully retrieved metadata from ${name}.`)
              const newResults = results;
              results.push({
                'name': name,
                'id': id,
                'data': b64,
                'info': info
              })
              console.log(`Added ${name} to results.`)
              setResults(newResults);
              setSelectedId(id);
              // setTransferSize(transferSize - 1);
              return {
                statusCode: 200,
                statusDescription: `OK - ${name} RECEIVED`,
              }
            }
            else {
              console.log(`Failed to retrieve metadata from ${name}`)
              return {
                statusCode: 409,
                statusDescription: `ERROR - Bad data from ${name}`
              }
            }
          }
          else {
            console.log('Rejected upload request, bad data.')
            return {
              statusCode: 409,
              statusDescription: `ERROR - Bad data from ${name}`
            }
          }
        });
        server.start();
        return () => {
          console.log('here')
          server.stop();
        };
      }
      catch (error) {
        console.log(`ERROR: Couldn't run server: ${error}`)
        setWifiDisabled(true);
      }
    }

    if (Constants.appOwnership !== 'expo') {
      startServer();
    }
    else {
      console.log('failed to start server');
    }

  }, []);
  
  return (
    <></>
  );

}

export default Server;