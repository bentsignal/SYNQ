import { Text, View } from "react-native";

type IngestStepScreenProps = {
  title: string;
  description: string;
  detail?: string;
};

const IngestStepScreen = ({
  description,
  detail,
  title,
}: IngestStepScreenProps) => {
  return (
    <View className="flex-1 justify-center gap-4 pb-28">
      <View className="gap-3 rounded-3xl border border-border bg-card/60 p-5">
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        <Text className="text-base leading-6 text-muted-foreground">
          {description}
        </Text>
        {detail && (
          <Text className="text-sm font-semibold text-foreground">{detail}</Text>
        )}
      </View>
    </View>
  );
};

export default IngestStepScreen;
