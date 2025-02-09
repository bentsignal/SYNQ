import AsyncStorage from "@react-native-async-storage/async-storage";

export const check = (value: any) => {
  if (value === undefined || value === null) {
    return false;
  }
  else {
    return true;
  }
}

export const msToSec = (milliseconds: number) => {
  return Math.floor(milliseconds / 1000);
};

export const idgen = (len: number) => {
  let result = '';
  for (let i = 0; i < len; i++) {
    result += Math.floor(Math.random()*10).toString();
  }
  return Number(result);
}

export const isValidNumString = (str: string) => {
  return !isNaN(Number(str));
}

// get file name from global path
export const getFileName = (path?: string) => {
  return path ? path.split('/').pop() : '';
}

export const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const getCompletion = (size: number, progress: number) => {
  try {
    if (size === 0) {
      return 0;
    }
    let result = ((1 - ((progress - 1) / size)) * 100);
    if (result < 0) {
      return 0;
    }
    else if (result > 100) {
      return 100;
    }
    else {
      return result;
    }
  }
  catch (error) {
    console.error('Error getting completion percentage:', error);
    return 0;
  }
}

export const getExportNumber = async () => {
  try {
    const numberString = await AsyncStorage.getItem('exportNumber');
    if (numberString && isValidNumString(numberString)) {
      let num = Number(numberString);
      num++;
      await AsyncStorage.setItem('exportNumber', num.toString());
      return num;
    }
    else {
      throw new Error('Bad data');
    }
  }
  catch (error) {
    await AsyncStorage.setItem('exportNumber', '1');
    return 1;
  }
}

export const getDurationString = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.ceil(duration / 60) % 60;
  return `${hours > 0 ? `${hours} hour${hours === 1 ? '' : 's'} ` : ''}${minutes > 0 ? `${minutes} minute${minutes === 1 ? '' : 's'}` : ''}`;
}
