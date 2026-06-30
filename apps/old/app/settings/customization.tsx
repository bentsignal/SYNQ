import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import Option from "@/src/components/Option";
import PageTitle from "@/src/components/PageTitle";
import Analytics from "@/src/components/settings/Analytics";
import AppIcon from "@/src/components/settings/AppIcon";
import CategoryTitle from "@/src/components/settings/CategoryTitle";
import Haptic from "@/src/components/settings/Haptic";
import Theme from "@/src/components/settings/Theme";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { posthog } from "@/src/lib/posthog";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Customization() {
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();

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
              handlePress={() => {
                posthog.capture("check_premium", {
                  premium: premium,
                });
                router.push("/premium");
              }}
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
}

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
