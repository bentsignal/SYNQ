import { Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Styles } from "@/constants/Styles";
import { Colors } from '@/constants/Colors';
import { PageTitle } from '@/components/PageTitle';
import { Top } from "@/components/Top";
import { ImportOption } from "@/components/ImportOption";


const Home = () => {
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Import Music'/>
      <ImportOption 
        title='WiFi Transfer'
        desc='Import from your computer'
        icon={require('@/assets/icons/wifi.png')}
        handlePress={() => router.push('/library')}
      />
      <ImportOption 
        title='Files'
        desc='Import from your files'
        icon={require('@/assets/icons/folder.png')}
        handlePress={() => router.push('/library')}
      />
    </SafeAreaView>
  );
}

export default Home;