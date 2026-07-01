import { Colors, Themes } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import PremiumOption from "@/src/features/premium/components/PremiumOption";
import { darkenColor } from "@/src/lib/color-utils";
import CustomButton from "@/src/shared/components/CustomButton";
import Loading from "@/src/shared/components/Loading";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PremiumPurchasePanelProps = {
  active: boolean;
  end: string;
  error: boolean;
  handlePurchase: () => void;
  handleRestore: () => void;
  lifetimeCost: string;
  loading: boolean;
  monthlyCost: string;
  monthlyText: string;
  purchaseText: string;
  renew: boolean;
  selected: number;
  setOption: (option: number, text: string) => void;
  theme: string;
  yearlyCost: string;
  yearlyText: string;
};

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

const PremiumPurchasePanel = ({
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
  theme,
  yearlyCost,
  yearlyText,
}: PremiumPurchasePanelProps) => {
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
    <View style={Local.container}>
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
  );
};

const Local = StyleSheet.create({
  container: {
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
  text: {
    color: Colors.text,
  },
});

export default PremiumPurchasePanel;
