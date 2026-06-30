import { View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";

import InfoModal from "@/src/components/modals/InfoModal";
import PageTitle from "@/src/components/PageTitle";
import SettingsButton from "@/src/components/SettingsButton";

import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";

export default function ImportHeader() {

  const {
    results, loadAnimInProgress,
  } = useImportFlowContext();
  const { premium } = usePremiumContext();
  const { setShowInfoModal } = useAppShellContext();

  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const titleInit = pathname === '/import/files' ? 'Import Files' : 'Transfer Files';
  const [title, setTitle] = useState(titleInit);

  useEffect(() => {
    if (pathname === '/import/files') {
      setTitle('Import Files');
    }
    else if (pathname === '/import/wifi') {
      setTitle('Transfer Files');
    }
    else if (pathname === '/import/export') {
      setTitle('Export Files');
    }
    else if (pathname === '/import/save') {
      setTitle('Save Files');
    }
  }, [pathname]);

  return (
    <View style={[Local.container, {paddingTop: insets.top + 10}]}>
      <InfoModal />
      <PageTitle 
        title={title}
        showList={false && results.length > 1 && premium && !loadAnimInProgress}
        infoHandler={() => setShowInfoModal(true)}
        rightHandComponent={<SettingsButton />}
      />
    </View>
  );

}

const Local = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
});
