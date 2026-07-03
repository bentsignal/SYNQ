import type { PropsWithChildren } from "react";
import { createStore } from "rostra";
import {
  useCustomizationSettingsStore,
  type CustomizationSettingsStore,
} from "../hooks/use-customization-settings";

type CustomizationSettingsStoreProps = object;

const { Store, useStore } = createStore<
  CustomizationSettingsStoreProps,
  CustomizationSettingsStore
>(useCustomizationSettingsStore);

export function CustomizationSettingsProvider({
  children,
}: PropsWithChildren) {
  return <Store>{children}</Store>;
}

export function useCustomizationSettingsSelector<SelectedValue>(
  selector: (store: CustomizationSettingsStore) => SelectedValue,
) {
  return useStore(selector);
}
