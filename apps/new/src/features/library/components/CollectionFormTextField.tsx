import { Text, TextInput } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type CollectionFormTextFieldProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  editable: boolean;
  inputMode?: "decimal" | "email" | "numeric" | "search" | "tel" | "text" | "url";
  keyboardType?: "default" | "number-pad";
  label: string;
  onChangeText?: (value: string) => void;
  placeholder: string;
  returnKeyType: "done" | "next";
  value: string;
};

export function CollectionFormTextField({
  autoCapitalize,
  autoCorrect,
  editable,
  inputMode,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  returnKeyType,
  value,
}: CollectionFormTextFieldProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        {label}
      </Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        className="min-h-[50px] rounded-lg border px-3.5 text-base font-bold"
        editable={editable}
        inputMode={inputMode}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={returnKeyType}
        style={{ borderColor: theme.border, color: theme.primaryText }}
        value={value}
      />
    </>
  );
}
