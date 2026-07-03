import { useLocalSearchParams } from "expo-router";
import { parseNumericRouteParam } from "../services/route-param-service";

export function useNumericRouteParam(paramName = "id") {
  const params = useLocalSearchParams<Record<string, string | string[]>>();

  return parseNumericRouteParam(params[paramName]);
}
