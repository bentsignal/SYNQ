import React, { createContext, useContext, useState, useEffect } from 'react';
import { useThemeContext } from '@/context/ThemeProvider';
import CFG from '@/constants/Config';
import { connect } from '@/lib/PurchaseManager';
import { restorePurchases } from '@/lib/PurchaseManager';
import { Colors } from '@/constants/Colors';

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
  const [premium, setPremium] = useState<boolean>(true);

  const checkPurchases= async () => {
    if (CFG.devTestFreeVersion) {
      await forceResetTheme();
      return;
    }
    else {
      // restore purchases
      await connect();
      const restored = await restorePurchases();
      if (restored === '') {
        setPremium(false);
        await forceResetTheme();
      }
      else {
        setPremium(true);
      }
    }
  }

  const forceResetTheme = async () => {
    console.log(theme);
    if (theme !== Colors.main) {  
      changeTheme(Colors.main);
    }
  }

  useEffect(() => {
    try {
      checkPurchases();
    }
    catch (error) {
      console.log('error checking purchases:', error);
    }
  }, []);

  return (
    <PremiumContext.Provider value={{ premium, setPremium }}>
      {children}
    </PremiumContext.Provider>
  );
  
}

export default PremiumProvider;