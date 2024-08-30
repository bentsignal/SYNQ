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
    return error;
  }
}

export const restorePurchases = async (): Promise<{success: boolean; id: string}> => {
  try {
    
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
          return {success: true, id: productId};
        }
      }
    }
  
    return {success: false, id: ''};

  }
  catch (error) {
    return {success: false, id: 'error'};
  }
  

}