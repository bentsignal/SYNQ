import type { ReactNode } from "react";
import { createStore } from "rostra";
import {
  usePremiumEntitlementStore,
  type PremiumEntitlementValue,
} from "../hooks/use-premium-entitlement-store";

const { Store, useStore } = createStore<object, PremiumEntitlementValue>(
  usePremiumEntitlementStore,
);

export function PremiumEntitlementProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <Store>{children}</Store>;
}

export function usePremiumEntitlementSelector<SelectedValue>(
  selector: (store: PremiumEntitlementValue) => SelectedValue,
) {
  return useStore(selector);
}

export function usePremiumEntitlement() {
  return usePremiumEntitlementSelector((store) => store);
}
