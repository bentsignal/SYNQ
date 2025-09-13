import CustomButton from "@/src/components/CustomButton";
import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import Option from "@/src/components/Option";
import CategoryTitle from "@/src/components/settings/CategoryTitle";
import Haptic from "@/src/components/settings/Haptic";
import PremiumToggle from "@/src/components/settings/PremiumToggle";
import Theme from "@/src/components/settings/Theme";
import { Colors } from "@/src/constants/Colors";
import CFG, { SOCIAL_LINKS } from "@/src/constants/Config";
import { Styles } from "@/src/constants/Styles";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { darkenColor } from "@/src/controllers/ColorController";
import { Link, router } from "expo-router";
import * as StoreReview from "expo-store-review";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { posthog } from "@/lib/posthog";

const Settings = () => {
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();

  const callReview = async () => {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
    }
  };

  const handleSocialPress = (url: string) => {
    posthog.capture("social_press", {
      url,
    });
    Linking.openURL(url);
  };

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
          desc={premium ? "Manage your subcription" : "Unlock all features"}
          icon={require("@/src/assets/icons/premium.png")}
          disabled={false}
          handlePress={() => {
            posthog.capture("check_premium", {
              premium: premium,
            });
            router.push("/premium");
          }}
          iconTint={theme}
          bg={Colors.textbox}
        />
        <Option
          title="Customization"
          desc="Tailor your experience"
          icon={require("@/src/assets/icons/customize.png")}
          disabled={false}
          handlePress={() => router.push("/settings/customization")}
          bg={Colors.textbox}
        />
        <Option
          title="Backup & Restore"
          desc="Backup or restore your library"
          icon={require("@/src/assets/icons/backup.png")}
          disabled={false}
          bg={Colors.textbox}
          handlePress={() => router.push("/settings/backup")}
        />
        <View style={Local.buttonsContainer}>
          {/* <CustomButton 
            title="Contact Support"
            buttonWidth={200}
            handlePress={() => Linking.openURL('https://directedbyshawn.com/synq-support')}
          /> */}
          <CustomButton
            title="Leave a Review"
            buttonWidth={200}
            handlePress={callReview}
          />
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://directedbyshawn.com/synq-support")
            }
          >
            <Text style={Local.supportText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
        <View style={Local.socialContainer}>
          <TouchableOpacity
            onPress={() => handleSocialPress(SOCIAL_LINKS.x)}
            style={[Local.socialLink]}
          >
            <Image
              source={require("@/src/assets/icons/x.png")}
              style={[
                Local.socialIcon,
                {
                  width: 25,
                  height: 25,
                },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={Local.socialLink}
            onPress={() => handleSocialPress(SOCIAL_LINKS.instagram)}
          >
            <Image
              style={Local.socialIcon}
              source={require("@/src/assets/icons/instagram.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={Local.socialLink}
            onPress={() => handleSocialPress(SOCIAL_LINKS.discord)}
          >
            <Image
              style={Local.socialIcon}
              source={require("@/src/assets/icons/discord.png")}
            />
          </TouchableOpacity>
        </View>
        {__DEV__ && CFG.devShowPremiumToggle && (
          <>
            <CategoryTitle title="Premium Toggle" />
            <View style={Local.settingsCategoryContainer}>
              <PremiumToggle />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const Local = StyleSheet.create({
  title: {
    ...Styles.h1,
    color: Colors.text,
    textAlign: "left",
    width: "90%",
    marginBottom: 20,
  },
  container: {
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  settingsCategoryContainer: {
    width: "90%",
  },
  scrollView: {
    width: "100%",
    paddingTop: 20,
  },
  scrollViewContent: {
    alignItems: "center",
  },
  buttonsContainer: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "90%",
  },
  socialIcon: {
    width: 30,
    height: 30,
    tintColor: Colors.text,
  },
  socialLink: {
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  supportText: {
    ...Styles.h6,
    color: Colors.infoText,
  },
});

export default Settings;
