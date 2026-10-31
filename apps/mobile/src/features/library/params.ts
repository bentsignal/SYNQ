import { useLocalSearchParams } from "expo-router";

/** A route's `id` parameter as a number (NaN when it's missing). */
export function useIdParam() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return Number(id);
}

/** Song ids from a route parameter: "3,12,40". */
export function songIdsParam(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
}
