import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
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

  const Local = StyleSheet.create({
    buttonWrapper: {
      ...Styles.roundedContainer,
      ...customStyles,
      minWidth: 100,
      height: 42,
      justifyContent: 'center',
      backgroundColor: disabled ? disabledColor : background,
      width: buttonWidth ? buttonWidth: 100,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      color: textColor ? textColor: 'black',
    },
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={opacity ? opacity : 0.8}
      style={Local.buttonWrapper}
      disabled={disabled}
    >
      <Text style={Local.buttonText}>
        {title}
      </Text>
    </TouchableOpacity>
  );

}

export default CustomButton;