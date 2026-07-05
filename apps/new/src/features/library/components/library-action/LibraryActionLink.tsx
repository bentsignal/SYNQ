import { Link, type LinkProps } from "expo-router";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function LibraryActionLink({
  flexGrow = 1,
  href,
  label,
  minWidth = 132,
  theme,
}: {
  flexGrow?: number;
  href: LinkProps["href"];
  label: string;
  minWidth?: number;
  theme: CustomizationTheme;
}) {
  return (
    <Link
      className="min-h-11 overflow-hidden rounded-lg border px-3.5 text-center text-[13px] font-extrabold uppercase leading-[42px]"
      href={href}
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.accent,
        flexGrow,
        minWidth,
      }}
    >
      {label}
    </Link>
  );
}
