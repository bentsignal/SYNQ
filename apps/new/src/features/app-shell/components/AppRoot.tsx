import { StatusBar } from "expo-status-bar";
import { AppNavigation } from "./AppNavigation";

export function AppRoot() {
  return (
    <>
      <AppNavigation />
      <StatusBar style="dark" />
    </>
  );
}
