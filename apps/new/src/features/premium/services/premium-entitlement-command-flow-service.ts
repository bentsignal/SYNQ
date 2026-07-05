import type { PremiumEntitlementStatus } from "../types/premium-purchase";
import {
  getPremiumEntitlementCheckingAction,
  getPremiumEntitlementFailAction,
  getPremiumEntitlementSucceedAction,
  type PremiumEntitlementAction,
} from "./premium-entitlement-state-service";
import { getPremiumMutationErrorMessage } from "./premium-mutation-error-service";

type PremiumEntitlementDispatch = (action: PremiumEntitlementAction) => void;

export const runPremiumEntitlementApplyCommand = ({
  dispatch,
  status,
}: {
  dispatch: PremiumEntitlementDispatch;
  status: PremiumEntitlementStatus;
}) => {
  dispatch(getPremiumEntitlementSucceedAction(status));
};

export const runPremiumEntitlementRefreshCommand = async ({
  checkPremiumEntitlement,
  dispatch,
}: {
  checkPremiumEntitlement: () => Promise<PremiumEntitlementStatus>;
  dispatch: PremiumEntitlementDispatch;
}) => {
  dispatch(getPremiumEntitlementCheckingAction());

  try {
    dispatch(
      getPremiumEntitlementSucceedAction(await checkPremiumEntitlement()),
    );
  } catch (caughtError) {
    dispatch(
      getPremiumEntitlementFailAction(
        getPremiumMutationErrorMessage({
          caughtError,
          mutation: "check-entitlement",
        }),
      ),
    );
  }
};
