import { PremiumScreenView } from "../components/PremiumScreenView";
import { usePremiumScreenController } from "../hooks/use-premium-screen-controller";

export function PremiumScreen() {
  return <PremiumScreenView {...usePremiumScreenController()} />;
}
