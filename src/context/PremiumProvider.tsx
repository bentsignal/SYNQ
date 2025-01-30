import React, { createContext, useContext, useState, useEffect } from 'react';
import { useThemeContext } from '@/src/context/ThemeProvider';
import CFG from '@/src/constants/Config';
import { connect } from '@/src/controllers/PurchaseController';
import { restorePurchases } from '@/src/controllers/PurchaseController';
import { Colors } from '@/src/constants/Colors';
import { getAppIcon, setAppIcon } from 'expo-icon-handler';
import { getIcon } from '../constants/Logos';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  children?: React.ReactNode;
}

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

  const checkPurchases= async () => {

    const premiumSubscriptions = ['SYNQPremiumLifetime', 
      'SYNQPremiumMonthly', 'SYNQPremiumYearly'];

    try {

      const premiumSavedData = await AsyncStorage.getItem('premium');

      if (premiumSavedData === 'true' && !CFG.devTestFreeVersion) {
        setPremium(true);
        return;
      }

      // restore purchases
      await connect();
      const purchases = await restorePurchases();
      if (premiumSubscriptions.includes(purchases?.name) && !CFG.devTestFreeVersion) {
        setPremium(true);
        await AsyncStorage.setItem('premium', 'true');
      }
      else {
        setPremium(false);
        await AsyncStorage.setItem('premium', 'false');
        await forceResetTheme();
      }
      
    }
    catch (error) {
      setPremium(false);
      forceResetTheme();
      await AsyncStorage.setItem('premium', 'false');
      console.log('error checking purchases:', error);
    }

  }


  const forceResetTheme = async () => {
    changeTheme(Colors.main, false);
    const current = await getAppIcon();
    console.log('current: ', current);
    if (current !== 'icon-blue') {
      setAppIcon(getIcon(Colors.main));
    }
  }

  useEffect(() => {
    checkPurchases();
  }, []);

  return (
    <PremiumContext.Provider value={{ premium, setPremium }}>
      {children}
    </PremiumContext.Provider>
  );
  
}

export default PremiumProvider;