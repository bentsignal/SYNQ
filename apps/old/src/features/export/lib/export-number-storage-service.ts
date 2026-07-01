import AsyncStorage from "@react-native-async-storage/async-storage";

const exportNumberStorageKey = "exportNumber";

const isValidNumString = (str: string) => {
  return !isNaN(Number(str));
};

export const getNextExportNumber = async () => {
  try {
    const numberString = await AsyncStorage.getItem(exportNumberStorageKey);
    if (numberString && isValidNumString(numberString)) {
      const nextNumber = Number(numberString) + 1;
      await AsyncStorage.setItem(exportNumberStorageKey, nextNumber.toString());
      return nextNumber;
    }

    throw new Error("Bad data");
  } catch {
    await AsyncStorage.setItem(exportNumberStorageKey, "1");
    return 1;
  }
};
