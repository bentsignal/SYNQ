import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import Notifications from "@/src/features/notifications/components/Notifications";
import PremiumHero from "@/src/features/premium/components/PremiumHero";
import PremiumPurchasePanel from "@/src/features/premium/components/PremiumPurchasePanel";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { usePremiumPurchaseFlow } from "@/src/features/premium/hooks/use-premium-purchase-flow";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { StyleSheet, View } from "react-native";

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
        <View style={Local.contentContainer}>
          <PremiumHero logo={logo} />
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
  contentContainer: {
    marginTop: 10,
    flexGrow: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
  },
  notifications: {
    position: "absolute",
    bottom: 30,
  },
});

export default PremiumScreen;
