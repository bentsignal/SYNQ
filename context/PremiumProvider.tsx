import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const [premium, setPremium] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setPremium(true);
    }, 200);
  }, []);

  return (
    <PremiumContext.Provider value={{ premium, setPremium }}>
      {children}
    </PremiumContext.Provider>
  );
  
}

export default PremiumProvider;