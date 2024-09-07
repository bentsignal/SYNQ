import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import PageTitle from '@/components/PageTitle';
import Option from "@/components/Option";
import Bar from "@/components/modals/Bar";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import Theme from "@/components/settings/Theme";
import CategoryTitle from "@/components/settings/CategoryTitle";
import { useGlobalContext } from "@/context/GlobalProvider";
import Haptic from "@/components/settings/Haptic";

const Settings = () => {

  const { 
    
    premium, 
  
  } = useGlobalContext();

  const Local = StyleSheet.create({
    container: {
      backgroundColor: Colors.background,
    },
    settingsCategoryContainer: {
      width: '90%',
    }
  });

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <PageTitle title='Settings'/>
      <Option 
        title="Premium"
        desc={premium ? "Manage your subcription" : 'Unlock all features'}
        icon={require('@/assets/icons/premium.png')}
        disabled={false}
        handlePress={() => router.push("/premium")}
      /> 
      <CategoryTitle title="Theme" requiresPremium={true}/>
      <View style={Local.settingsCategoryContainer}>
        <Theme />
      </View>
      <CategoryTitle title="Haptic Feedback" />
      <View style={Local.settingsCategoryContainer}>
        <Haptic />
      </View>
    </View>
  );
  
}

export default Settings;