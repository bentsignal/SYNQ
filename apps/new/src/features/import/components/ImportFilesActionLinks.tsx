import { Link } from "expo-router";
import { View } from "react-native";
import type { getImportFilesActionLinks } from "../services/import-files-navigation-state-service";

type ImportFilesActionLinksState = ReturnType<typeof getImportFilesActionLinks>;

type ImportFilesActionLinksProps = {
  accentColor: string;
  links: ImportFilesActionLinksState;
};

export function ImportFilesActionLinks({
  accentColor,
  links,
}: ImportFilesActionLinksProps) {
  return (
    <View className="flex-row flex-wrap gap-4">
      {links.map((link) => (
        <Link
          className="text-[15px] font-extrabold"
          href={link.href}
          key={link.href}
          style={{ color: accentColor }}
        >
          {link.label}
        </Link>
      ))}
    </View>
  );
}
