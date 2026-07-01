import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import CFG from "@/src/constants/Config";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import {
  connect,
  restorePurchases,
} from "@/src/features/premium/lib/purchase-service";
import {
  clearStoredPremiumExpiration,
  getStoredPremiumExpiration,
  setStoredLifetimePremiumExpiration,
  setStoredPremiumExpiration,
} from "@/src/features/premium/lib/premium-expiration-storage-service";
import { resetPremiumCustomization } from "@/src/features/theme/lib/premium-customization-reset-service";
import { posthog } from "@/src/lib/posthog";

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
  const { changeTheme } = useThemeContext();
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

  const forceResetTheme = useCallback(async () => {
    await resetPremiumCustomization(changeTheme);
  }, [changeTheme]);

  const checkPurchases = useCallback(async () => {
    const premiumSubscriptions = [
      "SYNQPremiumLifetime",
      "SYNQPremiumMonthly",
      "SYNQPremiumYearly",
    ];

    try {
      const expiration = await getStoredPremiumExpiration();

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
            await clearStoredPremiumExpiration();
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
          await setStoredLifetimePremiumExpiration();
        } else {
          await setStoredPremiumExpiration(purchase.expiration);
        }
      } else {
        setPremium(false);
        await clearStoredPremiumExpiration();
        await forceResetTheme();
      }
    } catch {
      setPremium(false);
      await clearStoredPremiumExpiration();
      await forceResetTheme();
    }
  }, [forceResetTheme]);

  useEffect(() => {
    checkPurchases();
  }, [checkPurchases]);

  const value = useMemo(
    () => ({ premium, setPremium }),
    [premium],
  );

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

export default PremiumProvider;
