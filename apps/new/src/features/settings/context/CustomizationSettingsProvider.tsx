import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";
import { useCustomizationSettings } from "../hooks/use-customization-settings";

type CustomizationSettingsContextValue = ReturnType<
  typeof useCustomizationSettings
>;

const CustomizationSettingsContext =
  createContext<CustomizationSettingsContextValue | null>(null);

export function CustomizationSettingsProvider({
  children,
}: PropsWithChildren) {
  const customizationSettings = useCustomizationSettings();

  return (
    <CustomizationSettingsContext.Provider value={customizationSettings}>
      {children}
    </CustomizationSettingsContext.Provider>
  );
}

export function useCustomizationSettingsContext() {
  const context = useContext(CustomizationSettingsContext);

  if (!context) {
    throw new Error(
      "useCustomizationSettingsContext must be used within CustomizationSettingsProvider.",
    );
  }

  return context;
}
