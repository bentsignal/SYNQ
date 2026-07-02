import { StatusBar } from "expo-status-bar";
import { useInitDB } from "@synq/db";
import { PlaybackProvider } from "@/src/features/playback/context/PlaybackProvider";
import { PremiumEntitlementProvider } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { CustomizationSettingsProvider } from "@/src/features/settings/context/CustomizationSettingsProvider";
import { AppNavigation } from "./AppNavigation";
import { DatabaseStateScreen } from "./DatabaseStateScreen";

export function AppRoot() {
  const { error, success } = useInitDB();

  if (error) {
    return (
      <>
        <DatabaseStateScreen
          detail={error.message}
          title="Database migration failed"
        />
        <StatusBar style="dark" />
      </>
    );
  }

  if (!success) {
    return (
      <>
        <DatabaseStateScreen
          detail="Applying local database migrations."
          showSpinner
          title="Preparing library"
        />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <>
      <PremiumEntitlementProvider>
        <CustomizationSettingsProvider>
          <PlaybackProvider>
            <AppNavigation />
          </PlaybackProvider>
        </CustomizationSettingsProvider>
      </PremiumEntitlementProvider>
      <StatusBar style="dark" />
    </>
  );
}
