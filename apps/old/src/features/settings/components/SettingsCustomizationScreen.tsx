import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import AppIcon from "@/src/features/settings/components/AppIcon";
import CategoryTitle from "@/src/features/settings/components/CategoryTitle";
import Haptic from "@/src/features/settings/components/Haptic";
import Theme from "@/src/features/settings/components/Theme";
import { useSettingsCustomizationActions } from "@/src/features/settings/hooks/use-settings-customization-actions";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import Option from "@/src/shared/components/Option";
import PageTitle from "@/src/shared/components/PageTitle";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import { ScrollView, StyleSheet, View } from "react-native";

const SettingsCustomizationScreen = () => {
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
  const { openPremium } = useSettingsCustomizationActions(premium);

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <View style={{ marginTop: 20 }} />
      <PageTitle title="Customization" />
      <ScrollView
        style={[Local.scrollView]}
        contentContainerStyle={Local.scrollViewContent}
      >
        <View style={Local.contentWrapper}>
          {!premium && (
            <Option
              title="Premium"
              desc={premium ? "Manage your subcription" : "Unlock all features"}
              icon={require("@/src/assets/icons/premium.png")}
              containerClass="bg-card"
              iconTint={theme}
              handlePress={openPremium}
            />
          )}
          <View style={Local.contentContainer}>
            <CategoryTitle title="Theme" requiresPremium={true} />
            <View>
              <Theme />
            </View>
            <CategoryTitle title="App Icon" requiresPremium={true} />
            <View>
              <AppIcon />
            </View>
            <CategoryTitle title="Haptic Feedback" />
            <View>
              <Haptic />
            </View>
            {/* <CategoryTitle title="Analytics" />
            <View>
              <Analytics />
            </View> */}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const Local = StyleSheet.create({
  container: {
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  scrollView: {
    width: "100%",
  },
  headerText: {
    color: Colors.text,
    ...Styles.h3,
    marginBottom: 10,
  },
  description: {
    color: Colors.infoText,
    ...Styles.p,
    marginBottom: 20,
    width: "100%",
  },
  scrollViewContent: {
    width: "100%",
  },
  contentWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "90%",
  },
  loadingContainer: {
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SettingsCustomizationScreen;
