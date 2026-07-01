import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { clearStoredPremiumExpiration } from "@/src/features/premium/lib/premium-expiration-storage-service";
import { syncPremiumEntitlement } from "@/src/features/premium/lib/premium-entitlement-service";
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
    try {
      const hasPremiumEntitlement = await syncPremiumEntitlement();
      setPremium(hasPremiumEntitlement);

      if (!hasPremiumEntitlement) {
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
