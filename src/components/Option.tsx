import colors from "@/src/lib/colors";
import { cn } from "@/src/lib/util";
import { ChevronRight } from "lucide-react-native";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ImportOptionProps = {
  title: string;
  desc: string;
  icon: ImageSourcePropType;
  disabled?: boolean;
  containerClass?: string;
  iconTint?: string;
  handlePress: () => void;
};

const Option = ({
  title,
  desc,
  icon,
  disabled,
  containerClass,
  iconTint,
  handlePress,
}: ImportOptionProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={disabled}
      className={cn(
        "bg-muted mb-3 w-11/12 flex-row items-center rounded-3xl p-5",
        disabled && "opacity-50",
        containerClass,
      )}
    >
      <Image
        source={icon}
        className="mr-4 size-12"
        tintColor={iconTint || colors.foreground}
      />
      <View>
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        <Text className="text-muted-foreground">{desc}</Text>
      </View>
      <View className="flex-1 items-end justify-end">
        <ChevronRight size={24} color={colors.foreground} />
      </View>
    </TouchableOpacity>
  );
};

export default Option;
