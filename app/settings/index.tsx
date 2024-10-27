import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import Option from "@/components/Option";
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

  return (
    <View style={[Styles.body, Local.container]}>
      <ScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
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
      </ScrollView>
    </View>
  );
  
}

const Local = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  settingsCategoryContainer: {
    width: '90%',
  },
  scrollView: {
    width: '100%',
    paddingTop: 20,
  },
  scrollViewContent: {
    alignItems: 'center',
  },
});

export default Settings;