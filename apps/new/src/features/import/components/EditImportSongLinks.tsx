import { Link } from "expo-router";
import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongEditControllerResultState } from "../services/import-song-edit-controller-result-state-service";

type EditImportSongLinksProps = {
  links: ImportSongEditControllerResultState["backLinks"];
};

export function EditImportSongLinks({ links }: EditImportSongLinksProps) {
  const theme = useCustomizationTheme();

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
