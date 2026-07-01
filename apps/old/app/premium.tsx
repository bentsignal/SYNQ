import { useCallback, useEffect, useState } from "react";
import CustomButton from "@/src/shared/components/CustomButton";
import Loading from "@/src/shared/components/Loading";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import Notifications from "@/src/features/notifications/components/Notifications";
import FeatureList from "@/src/features/premium/components/FeatureList";
import PremiumOption from "@/src/features/premium/components/PremiumOption";
import { Colors, Themes } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { NotificationType } from "@/src/constants/Types";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { darkenColor } from "@/src/lib/color-utils";
import * as PurchaseManager from "@/src/features/premium/lib/purchase-service";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { posthog } from "@/src/lib/posthog";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Premium = () => {
  const { addNotification } = useNotificationsContext();

  const { sendHaptic } = useHaptics();

  const { setPremium } = usePremiumContext();
  const { theme, logo } = useThemeContext();

  const [selected, setSelected] = useState(0);
  const [renew, setRenew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [end, setEnd] = useState("January 1, 2000");
  const [active, setActive] = useState(false);
  const [purchaseText, setPurchaseText] = useState("Purchase");
  const [monthlyText, setMonthlyText] = useState("Purchase");
  const [yearlyText, setYearlyText] = useState("Purchase");
  const [monthlyCost, setMonthlyCost] = useState("$∞");
  const [yearlyCost, setYearlyCost] = useState("$∞");
  const [lifetimeCost, setLifetimeCost] = useState("$∞");
  const [error, setError] = useState(false);

  const sendErrorNotification = useCallback(
    (title: string, message: string, brief: string, trace: string) => {
      addNotification(
        NotificationType.ERROR,
        title,
        brief,
        message,
        trace,
        () => {},
      );
    },
    [addNotification],
  );

  const setPrices = useCallback(
    ({
      lifetime,
      monthly,
      yearly,
    }: {
      lifetime: string;
      monthly: string;
      yearly: string;
    }) => {
      setLifetimeCost(lifetime);
      setMonthlyCost(monthly);
      setYearlyCost(yearly);
    },
    [],
  );

  const updateStatus = useCallback(
    ({
      id,
      renewal,
      end,
      trialAvailable,
    }: {
      id: string;
      renewal: boolean;
      end: string;
      trialAvailable: boolean;
    }) => {
      if (id === "") {
        setActive(false);
        setSelected(1);
        if (trialAvailable) {
          setMonthlyText("Start 1 month free trial");
          setYearlyText("Start 3 month free trial");
          setPurchaseText("Start 3 month free trial");
        }
      } else {
        setActive(true);
        setPremium(true);
        setRenew(renewal);
        setEnd(end);
        switch (id) {
          case "SYNQPremiumMonthly":
            setSelected(0);
            break;
          case "SYNQPremiumYearly":
            setSelected(1);
            break;
          case "SYNQPremiumLifetime":
            setSelected(2);
            break;
        }
      }
    },
    [setPremium],
  );

  useEffect(() => {
    const run = async () => {
      try {
        await PurchaseManager.connect();
        setPrices(await PurchaseManager.getPrices());
        updateStatus(await PurchaseManager.checkStatus());
        setLoading(false);
      } catch (error) {
        const trace = error instanceof Error ? error.message : String(error);
        sendErrorNotification(
          "Premium Error",
          "We ran into an issue trying to load premium options, please try again later",
          "Unable to load options",
          trace,
        );
        setError(true);
        setLoading(false);
      }
    };

    run();
  }, [sendErrorNotification, setPrices, updateStatus]);

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err),
    );
  };

  const getHeart = () => {
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

  const setOption = (option: number, purchaseText: string) => {
    if (!loading && !active && !error) {
      setSelected(option);
      setPurchaseText(purchaseText);
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      let id = "";
      switch (selected) {
        case 0:
          id = "Premium Monthly";
          break;
        case 1:
          id = "Premium Yearly";
          break;
        case 2:
          id = "Premium Lifetime";
          break;
        default:
          throw new Error("Invalid purchase option");
      }
      posthog.capture("attempt_purchase_premium", {
        tier: id,
      });
      await PurchaseManager.purchase(id);
      sendHaptic("success");
      setPremium(true);
      updateStatus(await PurchaseManager.checkStatus());
      setLoading(false);
      posthog.capture("success_purchase_premium", {
        tier: id,
      });
    } catch (error) {
      console.log("error purchasing premium:", error);
      const trace = error instanceof Error ? error.message : String(error);
      posthog.capture("error_purchase_premium", {
        error: trace,
        cancelled: trace.includes("cancelled"),
      });
      if (!trace.includes("cancelled")) {
        sendErrorNotification(
          "Premium Error",
          "We ran into an issue trying to complete your purchase, please try again later",
          "Unable to complete purchase",
          trace,
        );
      }
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const result = await PurchaseManager.restorePurchases();
      if (result) {
        setPremium(true);
        setActive(true);
        let message = "Successfully restored ";
        if (result.name === "SYNQPremiumMonthly") {
          setSelected(0);
          message += "your monthly subscription.";
        } else if (result.name === "SYNQPremiumYearly") {
          setSelected(1);
          message += "your yearly subscription.";
        } else if (result.name === "SYNQPremiumLifetime") {
          setSelected(2);
          message += "your lifetime subscription.";
        } else {
          message += "your purchase.";
        }
        sendHaptic("success");
        Alert.alert("Success", message, [{ text: "Ok" }]);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      sendHaptic("error");
      Alert.alert("ERROR", "Could not restore purchases", [
        {
          text: "Ok",
        },
      ]);
    }
  };

  const getBottom = () => {
    if (loading) {
      return <Loading height={100} width={200} />;
    } else if (error) {
      return (
        <Text style={[Local.messageText, Local.subText]}>
          An error occured, please try again later
        </Text>
      );
    } else if (active) {
      let first = "";
      let second = "";
      if (selected === 2) {
        first = "Your subscription will never expire";
        second = `Thank you for your support ${getHeart()}`;
      } else {
        first = `Your subscription will ${renew ? "renew" : "expire"} ${end}`;
        second = "To manage it, visit the App Store";
      }
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
            {getBottom()}
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

export default Premium;
