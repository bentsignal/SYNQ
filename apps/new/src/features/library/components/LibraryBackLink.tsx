import { Link, type Href } from "expo-router";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type LibraryBackLinkProps = {
  backLink: {
    href: Href;
    label: string;
  };
  theme: CustomizationTheme;
  variant?: "body" | "header";
};

const libraryBackLinkClassName = {
  body: "text-[15px] font-extrabold tracking-normal",
  header: "text-sm font-extrabold uppercase",
};

export function LibraryBackLink({
  backLink,
  theme,
  variant = "body",
}: LibraryBackLinkProps) {
  return (
    <Link
      className={libraryBackLinkClassName[variant]}
      href={backLink.href}
      style={{ color: theme.accent }}
    >
      {backLink.label}
    </Link>
  );
}
