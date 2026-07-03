import { Text, TextInput, type TextInputProps } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type EditImportSongTextFieldProps = {
  autoCapitalize?: TextInputProps["autoCapitalize"];
  inputMode?: TextInputProps["inputMode"];
  keyboardType?: TextInputProps["keyboardType"];
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  returnKeyType: TextInputProps["returnKeyType"];
  theme: CustomizationTheme;
  value: string;
};

export function EditImportSongTextField({
  autoCapitalize = "words",
  inputMode,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  returnKeyType,
  theme,
  value,
}: EditImportSongTextFieldProps) {
  return (
    <>
      <Text
        className="text-[13px] font-extrabold"
        style={{ color: theme.primaryText }}
      >
        {label}
      </Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className="min-h-[46px] rounded-lg border px-3 text-base"
        inputMode={inputMode}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={returnKeyType}
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border,
          color: theme.primaryText,
        }}
        value={value}
      />
    </>
  );
}
