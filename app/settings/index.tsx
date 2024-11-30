import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import Option from "@/components/Option";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import Theme from "@/components/settings/Theme";
import CategoryTitle from "@/components/settings/CategoryTitle";
import Haptic from "@/components/settings/Haptic";
import PremiumToggle from "@/components/settings/PremiumToggle";
import CFG from "@/constants/Config";
import { usePremiumContext } from "@/context/PremiumProvider";
import Bar from "@/components/modals/Bar";

const Settings = () => {

  const { premium }  = usePremiumContext();

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      
      <ScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Text style={Local.title}>Settings</Text>
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
        {CFG.devShowPremiumToggle && 
          <>
            <CategoryTitle title="Premium Toggle" />
            <View style={Local.settingsCategoryContainer}>
              <PremiumToggle />
            </View>
          </>
        }
      </ScrollView>
    </View>
  );
  
}

const Local = StyleSheet.create({
  title: {
    ...Styles.h1,
    color: Colors.text,
    textAlign: 'left',
    width: '90%',
    marginBottom: 20,
  },
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