import { ImportPremiumGate } from "../components/ImportPremiumGate";
import { ImportWifiScreenView } from "../components/ImportWifiScreenView";
import { useImportWifiScreenController } from "../hooks/use-import-wifi-screen-controller";

export function ImportWifiScreen() {
  return (
    <ImportPremiumGate>
      <ImportWifiContent />
    </ImportPremiumGate>
  );
}

function ImportWifiContent() {
  return <ImportWifiScreenView {...useImportWifiScreenController()} />;
}
