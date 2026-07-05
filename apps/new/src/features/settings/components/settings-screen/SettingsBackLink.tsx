import { Link } from "expo-router";
import type { CustomizationTheme } from "../../hooks/use-customization-theme";
import type { SettingsBackLinkState } from "./SettingsScreenTypes";

export function SettingsBackLink({
  backLink,
  theme,
}: {
  backLink: SettingsBackLinkState;
  theme: CustomizationTheme;
}) {
  return (
    <Link
      className="text-[15px] font-extrabold"
      href={backLink.href}
      style={{ color: theme.accent }}
    >
      {backLink.label}
    </Link>
  );
}

