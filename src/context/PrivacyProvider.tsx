import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CFG from '@/src/constants/Config';

type Props = {
  children?: React.ReactNode;
}

interface PrivacyContextType {
  allowAnalytics: boolean;
  setAllowAnalytics: (allowAnalytics: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType>({
  allowAnalytics: true,
  setAllowAnalytics: () => {},
});

export const usePrivacyContext = () => useContext(PrivacyContext);

export default function PrivacyProvider({ children }: Props) {

  const [allowAnalytics, setAllowAnalytics] = useState(true);

  useEffect(() => {
    const loadAllowAnalytics = async () => {
      if (CFG.devDisableAnalytics) {
        setAllowAnalytics(false);
        return;
      }
      const allow= await AsyncStorage.getItem('allowAnalytics');
      if (allow !== null) setAllowAnalytics(allow === 'true');
    };
    loadAllowAnalytics();
  }, []);

  return (
    <PrivacyContext.Provider value={{ allowAnalytics, setAllowAnalytics }}>
      {children}
    </PrivacyContext.Provider>
  );

}
