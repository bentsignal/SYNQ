import type { PremiumEntitlementStatus } from "../types/premium-purchase";
import type { PremiumEntitlementAction } from "./premium-entitlement-state-service";
import { getPremiumMutationErrorMessage } from "./premium-screen-service";

type PremiumEntitlementDispatch = (action: PremiumEntitlementAction) => void;

export const runPremiumEntitlementApplyCommand = ({
  dispatch,
  status,
}: {
  dispatch: PremiumEntitlementDispatch;
  status: PremiumEntitlementStatus;
}) => {
  dispatch({ status, type: "succeed" });
};

export const runPremiumEntitlementRefreshCommand = async ({
  checkPremiumEntitlement,
  dispatch,
}: {
  checkPremiumEntitlement: () => Promise<PremiumEntitlementStatus>;
  dispatch: PremiumEntitlementDispatch;
}) => {
  dispatch({ type: "checking" });

  try {
    dispatch({
      status: await checkPremiumEntitlement(),
      type: "succeed",
    });
  } catch (caughtError) {
    dispatch({
      error: getPremiumMutationErrorMessage({
        caughtError,
        mutation: "check-entitlement",
      }),
      type: "fail",
    });
  }
};
