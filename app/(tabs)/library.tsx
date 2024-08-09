import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Styles } from "@/constants/Styles";
import { router } from "expo-router";
import InstructionsModal from "@/components/modals/InstructionsModal";
import PageTitle from '@/components/PageTitle';
import Option from "@/components/Option";
import Top from "@/components/Top";

const Library = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[Styles.body, {paddingTop: insets.top}]}>
      <InstructionsModal />
      <Top />
      <PageTitle title='Library'/>
    </View>
  );
}

export default Library;