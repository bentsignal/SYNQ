import { router } from "expo-router";
import { Cog } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import colors from "@/src/lib/colors";

export default function SettingsButton({ size = 24 }: { size?: number }) {
  return (
    <TouchableOpacity onPress={() => router.push("/settings")}>
      <Cog size={size} color={colors.foreground} />
    </TouchableOpacity>
  );
}
