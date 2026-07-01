import CustomButton from "@/src/shared/components/CustomButton";
import Loading from "@/src/shared/components/Loading";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import Notifications from "@/src/features/notifications/components/Notifications";
import FeatureList from "@/src/features/premium/components/FeatureList";
import PremiumOption from "@/src/features/premium/components/PremiumOption";
import { Colors, Themes } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { usePremiumPurchaseFlow } from "@/src/features/premium/hooks/use-premium-purchase-flow";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { darkenColor } from "@/src/lib/color-utils";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const openURL = (url: string) => {
  Linking.openURL(url).catch((err) =>
    console.error("Failed to open URL:", err),
  );
};

const getHeart = (theme: string) => {
  if (theme === Themes.blue) {
    return "💙";
  } else if (theme === Themes.purple) {
    return "💜";
  } else if (theme === Themes.pink) {
    return "💕";
  } else if (theme === Themes.red) {
    return "❤️";
  } else if (theme === Themes.orange) {
    return "🧡";
  } else if (theme === Themes.yellow) {
    return "💛";
  } else if (theme === Themes.mint) {
    return "💚";
  } else {
    return "💙";
  }
};

const PremiumScreen = () => {
  const { theme, logo } = useThemeContext();
  const {
    active,
    end,
    error,
    handlePurchase,
    handleRestore,
    lifetimeCost,
    loading,
    monthlyCost,
    monthlyText,
    purchaseText,
    renew,
    selected,
    setOption,
    yearlyCost,
    yearlyText,
  } = usePremiumPurchaseFlow();

  const renderBottom = () => {
    if (loading) {
      return <Loading height={100} width={200} />;
    } else if (error) {
      return (
        <Text style={[Local.messageText, Local.subText]}>
          An error occured, please try again later
        </Text>
      );
    } else if (active) {
      const first =
        selected === 2
          ? "Your subscription will never expire"
          : `Your subscription will ${renew ? "renew" : "expire"} ${end}`;
      const second =
        selected === 2
          ? `Thank you for your support ${getHeart(theme)}`
          : "To manage it, visit the App Store";

      return (
        <>
          <Text style={Local.messageText}>{first}</Text>
          <Text style={[Local.text, Local.subText]}>{second}</Text>
        </>
      );
    } else {
      return (
        <>
          <View style={Local.linkContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                openURL("https://directedbyshawn.com/synq-terms-conditions")
              }
            >
              <Text style={[Local.text, Local.subText]}>
                Terms of Service ·{" "}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                openURL("https://directedbyshawn.com/synq-privacy-policy")
              }
            >
              <Text style={[Local.text, Local.subText]}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          <CustomButton
            title={purchaseText}
            background={theme}
            disabledColor={darkenColor(theme, 40, 50)}
            textColor={"black"}
            buttonWidth={240}
            handlePress={handlePurchase}
          />
          <TouchableOpacity activeOpacity={0.9} onPress={handleRestore}>
            <Text style={[Styles.p, Local.restore, { color: theme }]}>
              Restore
            </Text>
          </TouchableOpacity>
        </>
      );
    }
  };

  return (
    <View style={[Styles.body, Local.wrapper]}>
      <Bar />
      <View style={Local.container}>
        <View style={Local.imageContainer}>
          <Image
            source={require("@/src/assets/images/premium-bg-downscaled.jpg")}
            style={Local.coverImage}
          />
          <LinearGradient
            style={Local.coverGradient}
            colors={["rgba(20, 20, 20, 0)", "rgba(20, 20, 20, 1)"]}
            pointerEvents={"none"}
          />
        </View>
        <View style={Local.featureListContainer}>
          <View style={Local.featureListWrapper}>
            <FeatureList />
          </View>
        </View>
        <View style={Local.contentContainer}>
          <Image source={logo} style={Local.logo} />
          <Text style={[Styles.h2, Local.premiumText]}>Premium</Text>
          <Text style={[Styles.h4, Local.text]}>Ad free. No limits.</Text>
          <View style={Local.bottomContainer}>
            <View style={Local.optionsContainer}>
              <PremiumOption
                tier={"Monthly"}
                price={monthlyCost}
                loading={loading}
                selected={selected === 0}
                handler={() => {
                  setOption(0, monthlyText);
                }}
              />
              <PremiumOption
                tier={"Yearly"}
                price={yearlyCost}
                loading={loading}
                selected={selected === 1}
                handler={() => {
                  setOption(1, yearlyText);
                }}
              />
              <PremiumOption
                tier={"Lifetime"}
                price={lifetimeCost}
                loading={loading}
                selected={selected === 2}
                handler={() => {
                  setOption(2, "Purchase");
                }}
              />
            </View>
            {renderBottom()}
          </View>
        </View>
        <Notifications customStyles={Local.notifications} />
      </View>
    </View>
  );
};

const Local = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.background,
    ...ModalStyles.roundedTop,
  },
  container: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: -1,
  },
  imageContainer: {
    height: "40%",
    width: "100%",
    ...ModalStyles.roundedTop,
  },
  featureListContainer: {
    height: "40%",
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 0,
    justifyContent: "center",
  },
  featureListWrapper: {
    height: "50%",
    width: "100%",
  },
  coverImage: {
    height: "100%",
    width: "100%",
    ...ModalStyles.roundedTop,
  },
  coverGradient: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    marginTop: 10,
    flexGrow: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
  },
  logo: {
    width: 50,
    height: 50,
    position: "absolute",
    top: -80,
  },
  premiumText: {
    color: Colors.text,
    marginBottom: 15,
  },
  text: {
    color: Colors.text,
  },
  bottomContainer: {
    alignItems: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  notifications: {
    position: "absolute",
    bottom: 30,
  },
  messageText: {
    color: Colors.text,
    fontWeight: "bold",
    marginBottom: 10,
  },
  linkContainer: {
    flexDirection: "row",
    paddingBottom: 10,
  },
  restore: {
    marginTop: 10,
  },
  subText: {
    color: Colors.infoText,
  },
});

export default PremiumScreen;
