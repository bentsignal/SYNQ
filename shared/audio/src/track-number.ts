export const getTrackNumberFromString = (value: string) => {
  const trackNumber = checkForTrackNumber(value);
  if (trackNumber) {
    return {
      strippedValue: value.substring(3),
      trackNumber,
    };
  }
  return { strippedValue: value, trackNumber: null };
};

export const checkForTrackNumber = (str: string) => {
  if (str.length < 3) return null;

  const firstTwoChars = str.substring(0, 2);
  const thirdChar = str[2];

  if (thirdChar !== " ") return null;

  const num = parseInt(firstTwoChars);
  if (isNaN(num)) return null;

  return num;
};
