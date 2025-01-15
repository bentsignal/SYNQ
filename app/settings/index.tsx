import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import Option from "@/components/Option";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import Theme from "@/components/settings/Theme";
import CategoryTitle from "@/components/settings/CategoryTitle";
import Haptic from "@/components/settings/Haptic";
import PremiumToggle from "@/components/settings/PremiumToggle";
import CFG from "@/constants/Config";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import Bar from "@/components/modals/Bar";
import CustomButton from "@/components/CustomButton";
import { SOCIAL_LINKS } from "@/constants/Config";
import ModalStyles from "@/components/modals/Styles";

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
        <Option 
          title="Customization"
          desc="Tailor your experience"
          icon={require('@/assets/icons/customize.png')}
          disabled={false}
          handlePress={() => router.push("/settings/customization")}
          bg={Colors.text}
        />
        <Option 
          title="Backup & Restore"
          desc="Backup or restore your library"
          icon={require('@/assets/icons/backup.png')}
          disabled={false}
          handlePress={() => router.push("/settings/backup")}
          bg={Colors.text}
        />
        <View style={Local.supportContainer}>
          <CustomButton 
            title="Contact Support"
            buttonWidth={200}
            handlePress={() => Linking.openURL('https://directedbyshawn.com/synq-support')}
          />
        </View>
        <View style={Local.socialContainer}>
          <TouchableOpacity onPress={() => Linking.openURL(SOCIAL_LINKS.x)} style={[Local.socialLink]}>
            <Image source={require('@/assets/icons/x.png')} style={[Local.socialIcon, {
              width: 25, 
              height: 25,
            }]} />
          </TouchableOpacity>
          <TouchableOpacity style={Local.socialLink} onPress={() => Linking.openURL(SOCIAL_LINKS.instagram)}>
            <Image style={Local.socialIcon} source={require('@/assets/icons/instagram.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={Local.socialLink} onPress={() => Linking.openURL(SOCIAL_LINKS.discord)}>
            <Image style={Local.socialIcon} source={require('@/assets/icons/discord.png')} />
          </TouchableOpacity>
        </View>
        {__DEV__ && CFG.devShowPremiumToggle && 
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
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
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
  supportContainer: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '90%',
    marginVertical: 10,
  },
  socialIcon: {
    width: 30,
    height: 30,
    tintColor: Colors.text,
  },
  socialLink: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Settings;