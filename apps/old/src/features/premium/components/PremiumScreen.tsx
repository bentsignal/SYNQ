import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import Notifications from "@/src/features/notifications/components/Notifications";
import FeatureList from "@/src/features/premium/components/FeatureList";
import PremiumPurchasePanel from "@/src/features/premium/components/PremiumPurchasePanel";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { usePremiumPurchaseFlow } from "@/src/features/premium/hooks/use-premium-purchase-flow";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, View } from "react-native";

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
          <PremiumPurchasePanel
            active={active}
            end={end}
            error={error}
            handlePurchase={handlePurchase}
            handleRestore={handleRestore}
            lifetimeCost={lifetimeCost}
            loading={loading}
            monthlyCost={monthlyCost}
            monthlyText={monthlyText}
            purchaseText={purchaseText}
            renew={renew}
            selected={selected}
            setOption={setOption}
            theme={theme}
            yearlyCost={yearlyCost}
            yearlyText={yearlyText}
          />
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
  notifications: {
    position: "absolute",
    bottom: 30,
  },
});

export default PremiumScreen;
