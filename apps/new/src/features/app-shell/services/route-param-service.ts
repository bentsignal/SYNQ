export const parseNumericRouteParam = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isFinite(id) ? id : null;
};
