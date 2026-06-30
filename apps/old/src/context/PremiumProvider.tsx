import React, { createContext, useContext, useEffect, useState } from "react";
import { Colors } from "@/src/constants/Colors";
import CFG from "@/src/constants/Config";
import { useThemeContext } from "@/src/context/ThemeProvider";
import {
  connect,
  restorePurchases,
} from "@/src/controllers/PurchaseController";
import { posthog } from "@/src/lib/posthog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAppIcon, setAppIcon } from "expo-icon-handler";
import { getIcon } from "../constants/Logos";

type Props = {
  children?: React.ReactNode;
};

interface PremiumContextType {
  premium: boolean;
  setPremium: (newValue: boolean) => void;
}

const PremiumContext = createContext<PremiumContextType>({
  premium: false,
  setPremium: () => {},
});

export const usePremiumContext = () => useContext(PremiumContext);

const PremiumProvider: React.FC<Props> = ({ children }) => {
  const { theme, changeTheme } = useThemeContext();
  const [premium, setPremium] = useState<boolean>(false);

  useEffect(() => {
    posthog.capture("$set", {
      $set: {
        dev: __DEV__,
      },
    });
  }, []);

  useEffect(() => {
    posthog.capture("$set", {
      $set: {
        premium: premium,
      },
    });
  }, [premium]);

  const checkPurchases = async () => {
    const premiumSubscriptions = [
      "SYNQPremiumLifetime",
      "SYNQPremiumMonthly",
      "SYNQPremiumYearly",
    ];

    try {
      const expiration = await AsyncStorage.getItem("expiration");

      if (expiration && !CFG.devTestFreeVersion) {
        if (expiration === "never") {
          setPremium(true);
          return;
        } else {
          const expirationDate = new Date(expiration);
          const currentDate = new Date();
          if (expirationDate > currentDate) {
            setPremium(true);
            return;
          } else {
            setPremium(false);
            await AsyncStorage.setItem("expiration", "null");
          }
        }
      }

      // restore purchases
      await connect();
      const purchase = await restorePurchases();
      if (
        purchase &&
        premiumSubscriptions.includes(purchase.name) &&
        !CFG.devTestFreeVersion
      ) {
        setPremium(true);
        if (
          purchase.expiration === null ||
          purchase.name === "SYNQPremiumLifetime"
        ) {
          await AsyncStorage.setItem("expiration", "never");
        } else {
          await AsyncStorage.setItem(
            "expiration",
            purchase.expiration.toISOString(),
          );
        }
      } else {
        setPremium(false);
        await AsyncStorage.setItem("expiration", "null");
        await forceResetTheme();
      }
    } catch (error) {
      console.log("error checking purchases:", error);
    }
  };

  const forceResetTheme = async () => {
    changeTheme(Colors.main, false);
    const current = await getAppIcon();
    if (current !== "icon-blue" && current !== "default") {
      setAppIcon(getIcon(Colors.main));
    }
  };

  useEffect(() => {
    checkPurchases();
  }, []);

  return (
    <PremiumContext.Provider value={{ premium, setPremium }}>
      {children}
    </PremiumContext.Provider>
  );
};

export default PremiumProvider;
