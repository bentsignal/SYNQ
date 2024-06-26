import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

import PageTitle from '@/components/PageTitle'
import Option from "@/components/Option";
import Top from "@/components/Top";

const Instructions = () => {
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Instructions'/>
      
    </SafeAreaView>
  )
}

export default Instructions