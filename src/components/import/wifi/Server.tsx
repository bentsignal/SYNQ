import { useEffect, useRef } from 'react';
import * as Network from 'expo-network';
import * as Device from 'expo-device';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { getWifiTransferSong, createImportDir } from '@/src/controllers/ImportExportController';
import Transfer from '@/src/assets/static/Transfer';
import { NotificationType } from '@/src/constants/Types';
import { idgen } from '@/lib/Util';
import { BridgeServer } from 'react-native-http-bridge-refurbished';
import CFG from '@/src/constants/Config';

const getIP = async () => {
  return await Network.getIpAddressAsync();
}

const Server = () => {

  const {

    homeState, results, transferProgress,
    serverStarted, routesInitialized,

    addNotification,

    setHomeState, setResults, setTransferSize,
    setExportDisabled, setWifiDisabled, setLoading,
    setIP, setSelectedId, setTransferProgress,
    setLoadAnimInProgress, setShowOverlay,
    setShowNotificationModal, setServerStarted,
    setRoutesInitialized,

  } = useGlobalContext();

  const resultsRef = useRef<Array<any>>([]);
  const homeStateRef = useRef(0);
  const midTransfer = useRef(false);
  const receivedRequests = new Set();

  useEffect(() => {
    resultsRef.current = results
  }, [results]);

  useEffect(() => {
    homeStateRef.current = homeState
  }, [homeState]);

  const sendErrorNotification = (trace: string) => {
    addNotification(
      NotificationType.ERROR,
      'Server Error',
      'Failed to start server',
      'There was an issue starting the server for web transfer. Restarting the app will usually resolve this',
      trace,
      () => {
        setShowOverlay(true);
        setShowNotificationModal(true);
      }
    );
  }

  // get IP address to display on page for user to connect to in browser
  useEffect(() => {
    const loadIP = async () => {
      try {
        setIP(await getIP());
      }
      catch (error) {
        console.log('error getting IP', error);
      }
    }
    loadIP();
  }, []);

  // initialize endpoints
  useEffect(() => {
    
    const server = new BridgeServer('http_service', true);
    server.listen(CFG.PORT);

    server.get('/', async (req: any, res: any) => {
      return res.html(Transfer());
    });

    server.get('/reset', async (req: any, res: any) => {
      setResults([]);
      return res.json({
        status: 200,
        message: "OK - RESET RESULTS"
      });
    });

    // @ts-ignore
    server.get('/checkConnection', async (req: any, res: any) => {
      return Device.deviceName ? Device.deviceName : undefined;
    });

    server.post('/startTransfer', async (req: any, res: any) => {
      if (homeStateRef.current != 1) {
        return res.json({
          status: 400,
          message: 'Must be on Wifi Transfer page in app'
        })
      }
      else if (midTransfer.current === true) {
        return res.json({
          status: 400,
          message: 'Transfer already in progress'
        });
      }
      else if (req.postData.size !== null && req.postData.size !== undefined && req.postData.size !== 0) {
        const size = req.postData.size;
        if (size > 2) {
          setLoadAnimInProgress(true);
        }
        setTransferSize(Number(size));
        setTransferProgress(0);
        setLoading(true);
        setExportDisabled(true);
        midTransfer.current = true;
        await createImportDir();
        return res.json({
          status: 200,
          message: "OK - READY TO TRANSFER"
        });
      }
      else {
        return res.json({
          status: 400,
          message: 'No data to transfer'
        });
      }
    });

    server.post('/finishTransfer', async (req: any, res: any) => {
      setLoading(false);
      setExportDisabled(false);
      setTransferSize(0);
      setTransferProgress(0);
      setLoadAnimInProgress(false);
      midTransfer.current = false;
      return res.json({
        status: 200, 
        message: "OK - FINISHED TRANSFER"
      });
    });

    server.post('/fileUpload', async (req: any, res: any) => {
      try {
        const body = req.postData
        const name = body.name ? body.name : '';
        const type = body.type ? body.type : '';
        const b64 = body.data ? body.data : '';
        const id = body.id ? body.id : '';

        const acceptedTypes = ['audio/mpeg', 'audio/flac', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/x-m4a'];

        if (name && acceptedTypes.includes(type) && b64 && !receivedRequests.has(id)) {
          const song = await getWifiTransferSong(name, id, type, b64);
          if (song) {
            receivedRequests.add(id);
            const newResults = resultsRef.current;
            newResults.push(song);
            setResults(newResults);
            resultsRef.current = newResults;
            setTransferProgress(newResults.length);
            setSelectedId(id);
            return res.json({
              status: 200,
              message: `OK - ${name} RECEIVED`,
            });
          }
          else {
            return res.json({
              status: 409,
              message: `ERROR - Bad data from ${name}`
            });
          }
        }
        else {
          return res.json({
            status: 409,
            message: `ERROR - Bad data from ${name}`
          });
        }
      }
      catch (error) {
        console.log('error uploading song:', error);
        return res.json({
          status: 500,
          message: `ERROR - Failed to upload song: ${error}`
        });
      }

    });

    return () => {
      server.stop();
    }

  }, []);
  
  return (
    <></>
  );

}

export default Server;