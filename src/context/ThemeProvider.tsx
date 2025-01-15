import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { getIcon, getLogo } from '@/constants/Logos';
import { setAppIcon } from 'expo-icon-handler';

type Props = {
  children?: React.ReactNode;
}

interface ThemeContextType {  
  theme: string;
  logo: any;
  changeTheme: (newTheme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: Colors.main,
  logo: require('@/src/assets/logo/logo-blue.png'),
  changeTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

const ThemeProvider: React.FC<Props> = ({ children }) => {

  const [theme, setTheme] = useState<string>(Colors.main);
  const [logo, setLogo] = useState(require('@/src/assets/logo/logo-blue.png'));

  const loadTheme = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      if (theme !== null && theme !== Colors.main) changeTheme(theme, false);
    }
    catch (error) {
      console.log('Failed to load theme:', error);
    }
  }

  const changeTheme = (newTheme: string, changeIcon: boolean = true) => {
    try {
      setTheme(newTheme);
      setLogo(getLogo(newTheme));
      if (changeIcon)setAppIcon(getIcon(newTheme));
      AsyncStorage.setItem('theme', newTheme);
    }
    catch {
      setTheme(Colors.main);
      setLogo(getLogo(Colors.main));
      if (changeIcon) setAppIcon(getIcon(Colors.main)); 
      AsyncStorage.setItem('theme', Colors.main);
    }
  }

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, logo, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
  
}

export default ThemeProvider;