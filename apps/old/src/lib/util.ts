import AsyncStorage from "@react-native-async-storage/async-storage";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const check = (value: any) => {
  if (value === undefined || value === null) {
    return false;
  } else {
    return true;
  }
};

export const msToSec = (milliseconds: number) => {
  return Math.floor(milliseconds / 1000);
};

export const idgen = (len: number) => {
  let result = "";
  for (let i = 0; i < len; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return Number(result);
};

export const isValidNumString = (str: string) => {
  return !isNaN(Number(str));
};

// get file name from global path
export const getFileName = (path?: string) => {
  return path ? (path.split("/").pop() ?? "") : "";
};

export const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const getCompletion = (size: number, progress: number) => {
  try {
    if (size === 0) {
      return 0;
    }
    let result = (1 - (progress - 1) / size) * 100;
    if (result < 0) {
      return 0;
    } else if (result > 100) {
      return 100;
    } else {
      return result;
    }
  } catch {
    return 0;
  }
};

export const getExportNumber = async () => {
  try {
    const numberString = await AsyncStorage.getItem("exportNumber");
    if (numberString && isValidNumString(numberString)) {
      let num = Number(numberString);
      num++;
      await AsyncStorage.setItem("exportNumber", num.toString());
      return num;
    } else {
      throw new Error("Bad data");
    }
  } catch {
    await AsyncStorage.setItem("exportNumber", "1");
    return 1;
  }
};

export const getDurationString = (duration: number, showSeconds = false) => {
  if (duration <= 0) return "";

  const seconds = duration % 60;
  const minutes = showSeconds
    ? Math.floor(duration / 60) % 60
    : Math.ceil(duration / 60) % 60;
  const hours = Math.floor(duration / 3600);

  const hoursString =
    hours > 0 ? `${hours} hour${hours === 1 ? "" : "s"} ` : "";
  const minutesString =
    minutes > 0 ? `${minutes} minute${minutes === 1 ? "" : "s"} ` : "";
  const secondsString =
    showSeconds && seconds > 0
      ? `${seconds} second${seconds === 1 ? "" : "s"}`
      : "";

  return `${hoursString}${minutesString}${secondsString}`;
};

export const checkForTrackNumber = (str: string): number | null => {
  if (str.length < 3) return null;

  const firstTwoChars = str.substring(0, 2);
  const thirdChar = str[2];

  if (thirdChar !== " ") return null;

  const num = parseInt(firstTwoChars);
  if (isNaN(num)) return null;

  return num;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
