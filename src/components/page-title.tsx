import { Text } from "react-native";

export default function PageTitle({ title }: { title: string }) {
  return <Text className="text-3xl font-bold text-foreground">{title}</Text>;
}
