import React, { createContext, useContext, useState, useEffect } from 'react';
import { useThemeContext } from '@/context/ThemeProvider';

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

  return (
    <PremiumContext.Provider value={{ premium, setPremium }}>
      {children}
    </PremiumContext.Provider>
  );
  
}

export default PremiumProvider;