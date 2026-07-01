import AsyncStorage from "@react-native-async-storage/async-storage";

const premiumExpirationStorageKey = "expiration";

export const getStoredPremiumExpiration = () => {
  return AsyncStorage.getItem(premiumExpirationStorageKey);
};

export const clearStoredPremiumExpiration = () => {
  return AsyncStorage.setItem(premiumExpirationStorageKey, "null");
};

export const setStoredLifetimePremiumExpiration = () => {
  return AsyncStorage.setItem(premiumExpirationStorageKey, "never");
};

export const setStoredPremiumExpiration = (expiration: Date) => {
  return AsyncStorage.setItem(
    premiumExpirationStorageKey,
    expiration.toISOString(),
  );
};
