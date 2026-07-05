import { Text, TextInput, View } from "react-native";
import type { getLibrarySongEditFieldState } from "../services/library-song-edit-field-state-service";

export type EditLibrarySongFieldState = ReturnType<
  typeof getLibrarySongEditFieldState
>[keyof ReturnType<typeof getLibrarySongEditFieldState>];

type EditLibrarySongFieldInputProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  fieldState: EditLibrarySongFieldState;
  inputStyle: {
    backgroundColor: string;
    borderColor: string;
    color: string;
  };
  onChangeText: (value: string) => void;
  placeholderTextColor: string;
  secondaryTextColor: string;
  value: string;
};

export function EditLibrarySongFieldInput({
  autoCapitalize,
  fieldState,
  inputStyle,
  onChangeText,
  placeholderTextColor,
  secondaryTextColor,
  value,
}: EditLibrarySongFieldInputProps) {
  return (
    <View className="gap-2">
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: secondaryTextColor }}
      >
        {fieldState.label}
      </Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        className="min-h-[46px] rounded-lg border px-3.5 text-[15px]"
        onChangeText={onChangeText}
        placeholder={fieldState.placeholder}
        placeholderTextColor={placeholderTextColor}
        returnKeyType={fieldState.returnKeyType}
        style={inputStyle}
        value={value}
      />
    </View>
  );
}
