export const msToSec = (milliseconds: number) => {
  return Math.floor(milliseconds / 1000);
};

export const idgen = (len: number) => {
  let result = '';
  for (let i = 0; i < len; i++) {
    result += Math.floor(Math.random()*10).toString();
  }
  return result;
}

export const isValidNumString = (str: string) => {
  return !isNaN(Number(str));
}

export const maybe = (value: any) => {
  return value ? value : '';
}

// get file name from global path
export const getFileName = (path: string) => {
  return path.split('/').pop() || '';
}