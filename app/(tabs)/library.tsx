import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { PageTitle } from '@/components/PageTitle'
import { Top } from "@/components/Top";

const Library = () => {
  return (
    <SafeAreaView style={Styles.container}>
      <Top />
      <PageTitle title='Your Library'/>
    </SafeAreaView>
  );
}

export default Library;