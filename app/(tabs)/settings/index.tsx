import { Text, View } from "react-native";
import { SafeAreaView, useSafeArea, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from 'expo-router'

import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

import { useGlobalContext } from '@/context/GlobalProvider'
import InstructionsModal from "@/components/modals/InstructionsModal";
import PageTitle from '@/components/PageTitle'
import Option from "@/components/Option";
import Top from "@/components/Top";

const Library = () => {
  const {showWelcome, setShowWelcome} = useGlobalContext();
  const insets = useSafeAreaInsets();
  return (
    <View style={[Styles.body, {paddingTop: insets.top}]}>
      <InstructionsModal />
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
        handlePress={() => {setShowWelcome(true)}}
      />
    </View>
  );
}

export default Library;