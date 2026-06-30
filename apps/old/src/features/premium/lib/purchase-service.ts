import { PUBLIC_REVENUE_CAT_KEY } from "@/src/constants/Keys";
import { PurchaseType } from "@/src/constants/Types";
import Purchases from "react-native-purchases";

export const connect = async () => {
  try {
    Purchases.configure({
      apiKey: PUBLIC_REVENUE_CAT_KEY,
      appUserID: null,
    });
    return true;
  } catch (error) {
    throw error;
  }
};

export const getPrices = async (): Promise<{
  lifetime: string;
  monthly: string;
  yearly: string;
}> => {
  const offerings = await Purchases.getOfferings();

  if (offerings) {
    return {
      lifetime:
        offerings.all["Premium Lifetime"].availablePackages[0].product
          .priceString,
      monthly:
        offerings.all["Premium Monthly"].availablePackages[0].product
          .priceString,
      yearly:
        offerings.all["Premium Yearly"].availablePackages[0].product
          .priceString,
    };
  }

  throw new Error("Failed to get prices");
};

export const restorePurchases = async (): Promise<PurchaseType | null> => {
  const restoredData = await Purchases.restorePurchases();
  const entitlement = restoredData.entitlements?.active?.Premium;

  if (!entitlement) {
    return null;
  }

  return {
    name: entitlement.productIdentifier,
    expiration: entitlement.expirationDate
      ? new Date(entitlement.expirationDate)
      : null,
  };
};

const getMonthName = (monthNumber: number) => {
  return new Date(2024, monthNumber - 1, 1).toLocaleString("en-US", {
    month: "long",
  });
};

const getExpirationDate = (date: string | null) => {
  if (!date) {
    return "";
  }

  const periodEndDate = new Date(date);
  const month = getMonthName(periodEndDate.getMonth() + 1);
  const day = periodEndDate.getDate();
  const year = periodEndDate.getFullYear();
  return `${month} ${day}, ${year}`;
};

export const checkStatus = async (): Promise<{
  id: string;
  renewal: boolean;
  end: string;
  trialAvailable: boolean;
}> => {
  const customerInfo = await Purchases.getCustomerInfo();

  if (customerInfo.entitlements?.active?.Premium) {
    const entitlement = customerInfo.entitlements.active.Premium;
    return {
      id: entitlement.productIdentifier,
      renewal: entitlement.willRenew,
      end: getExpirationDate(entitlement.expirationDate),
      trialAvailable: false,
    };
  }

  return {
    id: "",
    renewal: false,
    end: "",
    trialAvailable: Object.keys(customerInfo.allPurchaseDates).length === 0,
  };
};

export const purchase = async (productId: string) => {
  const offerings = await Purchases.getOfferings();
  if (productId && offerings.all[productId]?.availablePackages) {
    await Purchases.purchasePackage(offerings.all[productId].availablePackages[0]);
  }
};
