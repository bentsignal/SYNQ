import { Link, type Href } from "expo-router";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportResultBackLinkProps = {
  href: Href;
  label: string;
  theme: CustomizationTheme;
};

export function ImportResultBackLink({
  href,
  label,
  theme,
}: ImportResultBackLinkProps) {
  return (
    <Link
      className="text-[15px] font-extrabold"
      href={href}
      style={{ color: theme.accent }}
    >
      {label}
    </Link>
  );
}
