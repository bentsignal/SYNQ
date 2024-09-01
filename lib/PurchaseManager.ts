import Purchases from 'react-native-purchases';

export const connect = async () => {
  try {
    Purchases.configure({
      apiKey: 'appl_qzTfhRrmSegqQhRUukTmiUsVMIq',
      appUserID: null,
    });
    return true;
  }
  catch (error) {
    throw error;
  }
}

export const getPrices = async (): Promise<{lifetime: string, monthly: string, yearly: string}> => {
  
  let lifetimePrice = '';
  let monthlyPrice = '';
  let yearlyPrice = '';

  const offerings = await Purchases.getOfferings();

  if (offerings) {
    lifetimePrice = offerings.all['Premium Lifetime'].availablePackages[0].product.priceString;
    monthlyPrice = offerings.all['Premium Monthly'].availablePackages[0].product.priceString;
    yearlyPrice = offerings.all['Premium Yearly'].availablePackages[0].product.priceString;
    return {
      lifetime: lifetimePrice,
      monthly: monthlyPrice,
      yearly: yearlyPrice
    };
  }
  
  throw new Error('Failed to get prices');

}

export const restorePurchases = async (): Promise<string> => {
    
  const restoredData = await Purchases.restorePurchases();
  const { allPurchasedProductIdentifiers, allExpirationDates } = restoredData;

  const premiumSubscriptions = ['SYNQPremiumLifetime', 
  'SYNQPremiumMonthly', 'SYNQPremiumYearly'];

  for (const productId of premiumSubscriptions) {
    if (allPurchasedProductIdentifiers.includes(productId)) {
      const expirationDateString = allExpirationDates[productId];
      const expirationDate = expirationDateString ? new Date(expirationDateString) : null;
      const currentDate = new Date();
      if (!expirationDate || expirationDate > currentDate) {
        return(productId);
      }
    }
  }

  throw new Error('No premium subscription found');

}

const getMonthName = (monthNumber: number) => {
  return new Date(2024, monthNumber - 1, 1).toLocaleString('en-US', { month: 'long' });
}

const getExpirationDate = (date: string | null): string => {
  if (!date) {
    return '';
  }
  const periodEndDate = new Date(date);
  let dateString = '';
  const month = getMonthName(periodEndDate.getMonth()+1);
  const day = periodEndDate.getDate();
  const year = periodEndDate.getFullYear();
  dateString = `${month} ${day}, ${year}`;
  return dateString;
}

export const checkStatus = async (): Promise<{id: string, renewal: boolean, end: string, trialAvailable: boolean}> => {

  const customerInfo = await Purchases.getCustomerInfo();

  if (customerInfo.entitlements?.active?.Premium) {
    const entitlement = customerInfo.entitlements.active.Premium;
    return {
      id: entitlement.productIdentifier,
      renewal: entitlement.willRenew,
      end: getExpirationDate(entitlement.expirationDate),
      trialAvailable: false
    }
  }
  else {
    return {
      id: '',
      renewal: false,
      end: '',
      trialAvailable: Object.keys(customerInfo.allPurchaseDates).length === 0
    }
  }

}

export const purchase = async (productId: string) => {
  const offerings = await Purchases.getOfferings();
  if (productId && offerings.all[productId]?.availablePackages) {
    await Purchases.purchasePackage(offerings.all[productId].availablePackages[0]);
  }
}
