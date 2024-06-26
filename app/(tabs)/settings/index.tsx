import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router'

import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

import PageTitle from '@/components/PageTitle'
import Option from "@/components/Option";
import Top from "@/components/Top";

const Library = () => {
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Settings'/>
      {/* <Option 
        title="Synk Premium"
        desc="Manage your subcription"
        icon={require('@/assets/icons/premium.png')}
        disabled={false}
        handlePress={() => {}}
      /> */}
      <Option 
        title="Instructions"
        desc="How to import music to Spotify"
        icon={require('@/assets/icons/instructions.png')}
        disabled={false}
        handlePress={() => {router.replace('/settings/instructions')}}
      />
    </SafeAreaView>
  );
}

export default Library;