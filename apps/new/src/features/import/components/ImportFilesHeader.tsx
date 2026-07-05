import { Text, View } from "react-native";

type ImportFilesHeaderProps = {
  accentColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
};

export function ImportFilesHeader({
  accentColor,
  primaryTextColor,
  secondaryTextColor,
}: ImportFilesHeaderProps) {
  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: accentColor }}
      >
        Import files
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: primaryTextColor }}
      >
        Files
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: secondaryTextColor }}
      >
        Stage songs here before choosing whether to save them.
      </Text>
    </View>
  );
}
