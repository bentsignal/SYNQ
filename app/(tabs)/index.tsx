import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { readAsStringAsync } from 'expo-file-system';
import { useAssets } from 'expo-asset';

import { useGlobalContext } from "@/context/GlobalProvider";
import { Styles } from "@/constants/Styles";
import { Colors } from '@/constants/Colors';
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

const getTransferPage = async (assets: any) => {
  return await readAsStringAsync(assets[0].localUri ?? '')
}

const Home = () => {

  const {setShowWelcome, setTransferPage} = useGlobalContext();
  const [assets, error] = useAssets([require("../../assets/static/Transfer.html")]);

  if (assets) {
    readAsStringAsync(assets[0].localUri ?? '').then((page) => {
      setTransferPage(page);
    })
  }

  useEffect(() => {
    getShowWelcome().then((value) => {
      value === 'false' ? setShowWelcome(false) : setShowWelcome(true)
    })
    .catch((error) => {
      setShowWelcome(false)
    })
  }, [])

  const { homeState, setHomeState } = useGlobalContext();
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
    )
  }
  else if (homeState === 4) {
    return (
      <Failure />
    )
  }
  else {
    return (
      <SafeAreaView style={Styles.body}>
        <InstructionsModal dontShowOption={true}/>
        <Top />
        <PageTitle title='Import Music'/>
        <Option 
          title='Files'
          desc='Import from your files'
          icon={require('@/assets/icons/folder.png')}
          disabled={false}
          handlePress={() => setHomeState(2)}
        />
        <Option 
          title='Wifi Transfer'
          desc='Import from your computer'
          icon={require('@/assets/icons/wifi.png')}
          disabled={false}
          handlePress={() => {setHomeState(1)}}
        />
        <Option 
          title='Download'
          desc='Import from the web via URL'
          icon={require('@/assets/icons/download.png')}
          disabled={true}
          handlePress={() => {setHomeState(3)}}
        />
      </SafeAreaView>
    );
  }
}

export default Home;