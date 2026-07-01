import { getSelectedPremiumTierFromProduct } from "@/src/features/premium/lib/premium-products";

type PremiumStatus = {
  end: string;
  id: string;
  renewal: boolean;
  trialAvailable: boolean;
};

export type PremiumStatusViewState = {
  active: boolean;
  end?: string;
  monthlyText?: string;
  premium?: boolean;
  purchaseText?: string;
  renew?: boolean;
  selected?: number;
  yearlyText?: string;
};

export const getPremiumStatusViewState = ({
  id,
  renewal,
  end,
  trialAvailable,
}: PremiumStatus): PremiumStatusViewState => {
  if (id === "") {
    return {
      active: false,
      selected: 1,
      ...(trialAvailable
        ? {
            monthlyText: "Start 1 month free trial",
            purchaseText: "Start 3 month free trial",
            yearlyText: "Start 3 month free trial",
          }
        : {}),
    };
  }

  return {
    active: true,
    end,
    premium: true,
    renew: renewal,
    selected: getSelectedPremiumTierFromProduct(id),
  };
};
