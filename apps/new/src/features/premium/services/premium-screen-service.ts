import { getSettingsBackLink } from "../../settings/services/settings-navigation-service";
import type { PremiumPurchaseState, PremiumTier } from "../types/premium-purchase";
import {
  getPremiumActionState,
  getSelectedPremiumTier,
} from "./premium-action-state-service";
import { getPremiumStatusState } from "./premium-status-state-service";

export { premiumFeatureCopy } from "./premium-feature-copy-service";
export {
  getPremiumActionState,
  getSelectedPremiumTier,
  type PremiumActionState,
} from "./premium-action-state-service";
export {
  getPremiumStatusState,
  type PremiumStatusState,
} from "./premium-status-state-service";
export {
  getPremiumMutationErrorMessage,
  type PremiumMutationKind,
} from "./premium-mutation-error-service";

export const getPremiumScreenState = () => ({
  backLink: getSettingsBackLink(),
  header: {
    kicker: "SYNQ Premium",
    subtitle: "Unlock the full library workflow and keep the app sustainable.",
    title: "Premium",
  },
});

export const getPremiumViewState = ({
  state,
  tiers,
}: {
  state: PremiumPurchaseState;
  tiers: PremiumTier[];
}) => {
  const selectedTier = getSelectedPremiumTier({ state, tiers });

  return {
    actionState: getPremiumActionState({ selectedTier, state }),
    screenState: getPremiumScreenState(),
    statusState: getPremiumStatusState(state),
  };
};
