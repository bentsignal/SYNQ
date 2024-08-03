import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Styles } from "@/constants/Styles";
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
      <PageTitle title='Settings'/>
      <Option 
        title="Premium"
        desc="Manage your subcription"
        icon={require('@/assets/icons/premium.png')}
        disabled={true}
        handlePress={() => {}}
      /> 
    </View>
  );
  
}

export default Library;