import { useFonts } from "expo-font";

export const useFont = () => {
  const [fontLoaded] = useFonts({
    JakartaSans: require("@/src/assets/fonts/PlusJakartaSans-VariableFont_wght.ttf"),
  });

  return { fontLoaded };
};
