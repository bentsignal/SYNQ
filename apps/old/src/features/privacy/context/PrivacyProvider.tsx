import { getStoredAnalyticsPreference } from "@/src/features/privacy/lib/analytics-preference-storage-service";
import React, { createContext, useContext, useEffect, useState } from "react";

type PrivacyContextValue = {
  allowAnalytics: boolean;
  setAllowAnalytics: (allowAnalytics: boolean) => void;
};

type PrivacyProviderProps = {
  children?: React.ReactNode;
};

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export const usePrivacyContext = () => {
  const context = useContext(PrivacyContext);

  if (!context) {
    throw new Error("usePrivacyContext must be used within PrivacyProvider");
  }

  return context;
};

export const PrivacyProvider = ({ children }: PrivacyProviderProps) => {
  const [allowAnalytics, setAllowAnalytics] = useState(!__DEV__);

  useEffect(() => {
    const loadAllowAnalytics = async () => {
      const storedValue = await getStoredAnalyticsPreference();

      if (storedValue !== null) {
        setAllowAnalytics(storedValue === "true");
      }
    };

    void loadAllowAnalytics();
  }, []);

  return (
    <PrivacyContext.Provider value={{ allowAnalytics, setAllowAnalytics }}>
      {children}
    </PrivacyContext.Provider>
  );
};
