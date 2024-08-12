import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from "@/context/GlobalProvider";
import { Styles } from "@/constants/Styles";
import PageTitle from '@/components/PageTitle';
import Top from "@/components/Top";
import Option from "@/components/Option";
import WiFi from "@/components/import/wifi/WiFi";
import Files from "@/components/import/files/Files";
import { Success, Failure } from "@/components/Outcome";
import InstructionsModal from "@/components/modals/InstructionsModal";

const getShowWelcome = async () => {
  return await AsyncStorage.getItem('showWelcome')
}

const Home = () => {

  const { setShowWelcome } = useGlobalContext();

  useEffect(() => {
    getShowWelcome().then((value) => {
      value === 'false' ? setShowWelcome(false) : setShowWelcome(true)
    })
    .catch((error) => {
      setShowWelcome(false)
    })
  }, []);

  const { homeState, setHomeState } = useGlobalContext();
  const insets = useSafeAreaInsets();

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
      <View style={[Styles.body, {paddingTop: insets.top}]}>
        <InstructionsModal dontShowOption={true}/>
        <Top />
        <PageTitle 
          title='Import Music'
          infoHandler={() => setShowWelcome(true)}
          />
        <ScrollView
          style={{
            width: '100%'
          }}
          contentContainerStyle={{
            alignItems: 'center',
          }}
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
          <Option 
            title='Download'
            desc='Import from the web'
            icon={require('@/assets/icons/download.png')}
            disabled={true}
            handlePress={() => {setHomeState(3)}}
          />
        </ScrollView>
      </View>
    );
  }
  
}

export default Home;