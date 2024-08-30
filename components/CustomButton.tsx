import { Text, TouchableOpacity } from 'react-native';
import { Styles } from '@/constants/Styles';

type MainButtonProps = {
  title?: string;
  background?: string;
  disabledColor?: string;
  opacity?: number;
  handlePress?: () => void;
  disabled?: boolean;
  buttonWidth?: any;
  textColor?: string;
  customStyles?: {};
};

const CustomButton = ({
  title,
  background,
  disabledColor,
  opacity,
  handlePress,
  disabled,
  textColor,
  buttonWidth,
  customStyles,
}: MainButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={opacity ? opacity : 0.8}
      style={[customStyles ? customStyles : {}, Styles.buttonContainer, Styles.roundedContainer, {
          backgroundColor: disabled ? disabledColor : background, 
          width: buttonWidth ? buttonWidth: 100,
        }
      ]}
      disabled={disabled}
    >
      <Text style={[Styles.buttonText, {
        color: textColor ? textColor: 'black',
      }]}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default CustomButton;