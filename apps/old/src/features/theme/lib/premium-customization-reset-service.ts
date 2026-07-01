import { Colors } from "@/src/constants/Colors";
import { getIcon } from "@/src/constants/Logos";
import { getAppIcon, setAppIcon } from "expo-icon-handler";

type ChangeTheme = (theme: string, changeIcon?: boolean) => void;

export async function resetPremiumCustomization(changeTheme: ChangeTheme) {
  changeTheme(Colors.main, false);

  const currentIcon = await getAppIcon();
  if (currentIcon !== "icon-blue" && currentIcon !== "default") {
    setAppIcon(getIcon(Colors.main));
  }
}
