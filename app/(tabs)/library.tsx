import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

import PageTitle from '@/components/PageTitle'
import Top from "@/components/Top";

const Library = () => {
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Your Library'/>
      <View
        style={Styles.main}
      >
        <Text style={Styles.infoText}>Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}

export default Library;