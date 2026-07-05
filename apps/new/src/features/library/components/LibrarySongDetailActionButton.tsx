import type { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  LibraryActionButton,
  LibraryActionLink,
} from "./library-action";

type LibraryTheme = ReturnType<typeof useCustomizationTheme>;

type LibrarySongDetailActionButtonProps = {
  disabled: boolean;
  flexGrow?: number;
  label: string;
  minWidth?: number;
  onPress: () => void;
  theme: LibraryTheme;
  variant: "danger" | "primary" | "secondary";
};

export function LibrarySongDetailActionButton({
  disabled,
  flexGrow,
  label,
  minWidth,
  onPress,
  theme,
  variant,
}: LibrarySongDetailActionButtonProps) {
  return (
    <LibraryActionButton
      disabled={disabled}
      flexGrow={flexGrow}
      label={label}
      minWidth={minWidth}
      onPress={onPress}
      theme={theme}
      variant={variant}
    />
  );
}

type LibrarySongDetailActionLinkProps = {
  href: string;
  label: string;
  minWidth: number;
  theme: LibraryTheme;
};

export function LibrarySongDetailActionLink({
  href,
  label,
  minWidth,
  theme,
}: LibrarySongDetailActionLinkProps) {
  return (
    <LibraryActionLink
      href={href}
      label={label}
      minWidth={minWidth}
      theme={theme}
    />
  );
}
