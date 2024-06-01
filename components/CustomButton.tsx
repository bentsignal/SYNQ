import { Text, TouchableOpacity } from 'react-native';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';

type MainButtonProps = {
  title?: string;
  background?: string;
  handlePress?: () => void;
  disabled?: boolean;
};

const CustomButton = ({
  title,
  background,
  handlePress,
  disabled
}: MainButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[Styles.buttonContainer, {
        backgroundColor: disabled ? Colors.disabledButton : background, 
        height: 42}
      ]}
      disabled={disabled}
    >
      <Text style={Styles.buttonText}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default CustomButton;