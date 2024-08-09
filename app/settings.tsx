import { View } from "react-native";
import { Styles } from "@/constants/Styles";
import { router } from "expo-router";
import PageTitle from '@/components/PageTitle';
import Option from "@/components/Option";
import { Colors } from "@/constants/Colors";

const Settings = () => {

  return (
    <View style={[Styles.body, {
      paddingTop: 20,
      backgroundColor: Colors.background,
      }]}>
      <PageTitle title='Settings'/>
      <Option 
        title="Premium"
        desc="Manage your subcription"
        icon={require('@/assets/icons/premium.png')}
        disabled={false}
        handlePress={() => router.push("/premium")}
      /> 
    </View>
  );
  
}

export default Settings;