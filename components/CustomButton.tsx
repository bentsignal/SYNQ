import { Text, TouchableOpacity } from 'react-native';
import { Styles } from '@/constants/Styles';

type MainButtonProps = {
  title?: string;
  background?: string;
  handlePress?: () => void;
};

export const CustomButton = ({
  title,
  background,
  handlePress
}: MainButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[Styles.buttonContainer, {backgroundColor: background, height: 42}]}
    >
      <Text style={Styles.buttonText}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}