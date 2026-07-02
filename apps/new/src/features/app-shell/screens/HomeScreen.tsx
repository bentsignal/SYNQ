import { HomeScreenView } from "../components/HomeScreenView";
import { useHomeScreenController } from "../hooks/use-home-screen-controller";

export function HomeScreen() {
  return <HomeScreenView {...useHomeScreenController()} />;
}
