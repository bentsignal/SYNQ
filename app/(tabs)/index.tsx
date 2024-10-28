import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, ScrollView, StyleSheet } from 'react-native';
import { useGlobalContext } from "@/context/GlobalProvider";
import { Styles } from "@/constants/Styles";
import { importFiles } from "@/lib/SongManager";
import PageTitle from '@/components/PageTitle';
import Option from "@/components/Option";
import WiFi from "@/components/import/wifi/WiFi";
import Files from "@/components/import/files/Files";
import { Success, Failure } from "@/components/Outcome";
import InfoModal from "@/components/modals/InfoModal";
import Notifications from "@/components/notifications/Notifications";
import * as server from "expo-http-server";

const Home = () => {

  const { 

    serverStarted,
    
    setServerStarted, setShowWelcome, setShowInfoModal,
    setLoading, setImporting, setTransferProgress, 
    setTransferSize, setLoadAnimInProgress, 
    setExportDisabled, setResults,
  
  } = useGlobalContext();

  const { homeState, setHomeState } = useGlobalContext();

  const Local = StyleSheet.create({
    notifications: {
      position: 'absolute',
      bottom: 0,
    },
    scrollView: {
      width: '100%',
    },
    scrollViewContent: {
      alignItems: 'center',
    }
  });

  const browseFiles = () => {
    setLoading(true);
    setImporting(true);
    const updateCountdown = (value: number) => setTransferProgress(value);
    const updateSize = (value: number) => {
      setTransferSize(value)
      if (value > 2) {
        setLoadAnimInProgress(true);
      }
    };
    importFiles(updateCountdown, updateSize).then((results) => {
      setTransferSize(-1);
      setTransferProgress(-1);
      setImporting(false);
      setLoading(false);
      if (results.length > 0) {
        setExportDisabled(false);
        setResults(results);
      }
      else {
        setHomeState(0);
      }
    })
    .catch((error) => {
      console.log(error);
      setLoading(false);
      setImporting(false);
      setHomeState(4);
    })
  }

  if (homeState === 1) {
    return (
      <WiFi />
    );
  }
  else if (homeState === 2) {
    return (
      <Files />
    );
  }
  else if (homeState === 3) {
    return (
      <Success />
    );
  }
  else if (homeState === 4) {
    return (
      <Failure />
    );
  }
  else {
    return (
      <View style={Styles.body}>
        <InfoModal />
        <ScrollView
          style={Local.scrollView}
          contentContainerStyle={Local.scrollViewContent}
        >
          <PageTitle 
            title='Import Music'
            infoHandler={() => setShowInfoModal(true)}
          />
          <Option 
            title='Files'
            desc='Import from your files'
            icon={require('@/assets/icons/folder.png')}
            disabled={false}
            handlePress={() => {
              setLoading(true);
              setHomeState(2);
              setTimeout(() => {
                browseFiles();
              }, 10);
            }}
          />
          <Option 
            title='Network'
            desc='Import from your computer'
            icon={require('@/assets/icons/wifi.png')}
            disabled={false}
            handlePress={() => {
              if (!serverStarted) {
                setServerStarted(true);
                server.start();
              }
              setHomeState(1);
            }}
          />
        </ScrollView>
        <Notifications customStyles={Local.notifications}/>
      </View>
    );
  }
  
}

export default Home;