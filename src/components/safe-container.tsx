import { View, ViewProps } from "react-native";
import { cn } from "../lib/util";
import { BottomInset, TopInset } from "./safe-area-insets";

export const SafeContainer = ({
  children,
  className,
  topInset = true,
  bottomInset = true,
  ...props
}: {
  children: React.ReactNode;
  topInset?: boolean;
  bottomInset?: boolean;
} & ViewProps) => {
  return (
    <View className={cn("flex-1 px-6", className)} {...props}>
      {topInset && <TopInset />}
      {children}
      {bottomInset && <BottomInset />}
    </View>
  );
};
