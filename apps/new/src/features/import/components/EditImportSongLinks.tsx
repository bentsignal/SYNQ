import { Link } from "expo-router";
import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getImportSongEditBackLinks } from "../services/import-song-edit-navigation-service";

export function EditImportSongLinks() {
  const theme = useCustomizationTheme();
  const links = getImportSongEditBackLinks();

  return (
    <View className="flex-row flex-wrap gap-4">
      {links.map((link) => (
        <Link
          className="text-[15px] font-extrabold"
          href={link.href}
          key={link.href}
          style={{ color: theme.accent }}
        >
          {link.label}
        </Link>
      ))}
    </View>
  );
}
