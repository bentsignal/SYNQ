import { Text, View, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useGlobalContext } from "@/context/GlobalProvider";
import { Styles } from "@/constants/Styles";
import { Colors } from '@/constants/Colors';
import PageTitle from '@/components/PageTitle';
import Top from "@/components/Top";
import ImportOption from "@/components/import/ImportOption";
import WiFi from "@/components/import/wifi/WiFi";
import Files from "@/components/import/files/Files";
import CustomButton from '@/components/CustomButton'
import WelcomeModal from "@/components/modals/WelcomeModal";

const Home = () => {
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
  else {
    return (
      <SafeAreaView style={Styles.body}>
        <WelcomeModal />
        <Top />
        <PageTitle title='Import Music'/>
        <ImportOption 
          title='Files'
          desc='Import from your files'
          icon={require('@/assets/icons/folder.png')}
          disabled={false}
          handlePress={() => setHomeState(2)}
        />
        <ImportOption 
          title='WiFi Transfer'
          desc='Import from your computer'
          icon={require('@/assets/icons/wifi.png')}
          disabled={true}
          handlePress={() => {setHomeState(1)}}
        />
        <ImportOption 
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