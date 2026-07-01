import Sheets from "@/src/features/action-sheet/components/Sheets";
import { ActionSheetProvider } from "@/src/features/action-sheet/context/ActionSheetProvider";
import AppNavigation from "@/src/features/app-shell/components/AppNavigation";
import GlobalProgress from "@/src/features/app-shell/components/GlobalProgress";
import { AppShellProvider } from "@/src/features/app-shell/context/AppShellProvider";
import { GlobalProgressProvider } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useAppBootstrap } from "@/src/features/app-shell/hooks/use-app-bootstrap";
import { ImportFlowProvider } from "@/src/features/import/context/ImportFlowProvider";
import { NotificationsProvider } from "@/src/features/notifications/context/NotificationsProvider";
import { PlaybackAdProvider } from "@/src/features/playback/context/PlaybackAdProvider";
import PlaybackProvider from "@/src/features/playback/context/PlaybackProvider";
import PremiumProvider from "@/src/features/premium/context/PremiumProvider";
import { PrivacyProvider } from "@/src/features/privacy/context/PrivacyProvider";
import { SelectionProvider } from "@/src/features/selection/context/SelectionProvider";
import ThemeProvider from "@/src/features/theme/context/ThemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const AppRoot = () => {
  const { shouldPlayAd } = useAppBootstrap();

  return (
    <ThemeProvider>
      <PremiumProvider>
        <PlaybackProvider>
          <PlaybackAdProvider initShouldPlayAd={shouldPlayAd}>
            <ActionSheetProvider>
              <AppShellProvider>
                <GlobalProgressProvider>
                  <ImportFlowProvider>
                    <NotificationsProvider>
                      <PrivacyProvider>
                        <SelectionProvider>
                          <GestureHandlerRootView style={{ flex: 1 }}>
                            <GlobalProgress />
                            <Sheets />
                            <AppNavigation />
                          </GestureHandlerRootView>
                        </SelectionProvider>
                      </PrivacyProvider>
                    </NotificationsProvider>
                  </ImportFlowProvider>
                </GlobalProgressProvider>
              </AppShellProvider>
            </ActionSheetProvider>
          </PlaybackAdProvider>
        </PlaybackProvider>
      </PremiumProvider>
    </ThemeProvider>
  );
};

export default AppRoot;
