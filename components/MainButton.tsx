import { GestureResponderEvent, Text, TouchableOpacity } from 'react-native';

export type MainButtonProps = {
  title?: string;
  handlePress?: () => void;
};

export const MainButton = ({
  title,
  handlePress
}: MainButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text>
        {title}
      </Text>
    </TouchableOpacity>
  )
}