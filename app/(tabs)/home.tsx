import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Styles } from "@/constants/Styles";
import { Colors } from '@/constants/Colors';
import { PageTitle } from '@/components/PageTitle';
import { Top } from "@/components/Top";


const Home = () => {
  return (
    <SafeAreaView style={Styles.container}>
      <Top />
      <PageTitle title='Import Music'/>
    </SafeAreaView>
  );
}

export default Home;