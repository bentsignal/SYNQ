import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, ScrollView, StyleSheet } from 'react-native';
import { useGlobalContext } from "@/context/GlobalProvider";
import { Styles } from "@/constants/Styles";
import PageTitle from '@/components/PageTitle';
import Top from "@/components/Top";
import Option from "@/components/Option";
import WiFi from "@/components/import/wifi/WiFi";
import Files from "@/components/import/files/Files";
import { Success, Failure } from "@/components/Outcome";
import InfoModal from "@/components/modals/InfoModal";
import Notifications from "@/components/notifications/Notifications";

const Home = () => {

  const { 
    
    setShowWelcome, setShowInfoModal,
  
  } = useGlobalContext();

  const { homeState, setHomeState } = useGlobalContext();
  const insets = useSafeAreaInsets();

  const Local = StyleSheet.create({
    notifications: {
      position: 'absolute',
      bottom: 0,
    },
    container: {
      paddingTop: insets.top,
    },
    scrollView: {
      width: '100%',
    },
    scrollViewContent: {
      alignItems: 'center',
    }
  });

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
      <View style={[Styles.body, Local.container]}>
        <InfoModal />
        <Top />
        <PageTitle 
          title='Import Music'
          infoHandler={() => setShowInfoModal(true)}
          />
        <ScrollView
          style={Local.scrollView}
          contentContainerStyle={Local.scrollViewContent}
        >
          <Option 
            title='Files'
            desc='Import from your files'
            icon={require('@/assets/icons/folder.png')}
            disabled={false}
            handlePress={() => setHomeState(2)}
          />
          <Option 
            title='Network'
            desc='Import from your computer'
            icon={require('@/assets/icons/wifi.png')}
            disabled={false}
            handlePress={() => {setHomeState(1)}}
          />
        </ScrollView>
        <Notifications customStyles={Local.notifications}/>
      </View>
    );
  }
  
}

export default Home;