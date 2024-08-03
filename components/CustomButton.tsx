import { Text, TouchableOpacity } from 'react-native';
import { Styles } from '@/constants/Styles';

type MainButtonProps = {
  title?: string;
  background?: string;
  disabledColor?: string;
  handlePress?: () => void;
  disabled?: boolean;
};

const CustomButton = ({
  title,
  background,
  disabledColor,
  handlePress,
  disabled
}: MainButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[Styles.buttonContainer, , Styles.roundedContainer, {
        backgroundColor: disabled ? disabledColor : background, 
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