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
import ExportPrompt from "@/components/import/ExportPrompt";
import SavePrompt from "@/components/import/SavePrompt";  

const Home = () => {

  const { 

    serverStarted,
    
    setServerStarted, setShowInfoModal,
    setLoading, setTransferProgress, 
    setTransferSize, setLoadAnimInProgress, 
    setExportDisabled, setResults,
    setShowImportAd,
  
  } = useGlobalContext();

  const { homeState, setHomeState } = useGlobalContext();

  const browseFiles = () => {
    setLoading(true);
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
  else if (homeState === 5) {
    return (
      <ExportPrompt />
    );
  }
  else if (homeState === 6) {
    return (
      <SavePrompt />
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
              setResults([]);
              setShowImportAd(true);
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
              setShowImportAd(true);
              setLoading(true);
              setResults([]);
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

export default Home;