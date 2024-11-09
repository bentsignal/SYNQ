import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { darkenColor } from '@/lib/ColorManager';

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

  const bgColor = background ? background : Colors.altButton;

  const Local = StyleSheet.create({
    buttonWrapper: {
      ...Styles.roundedContainer,
      ...customStyles,
      minWidth: 100,
      height: 42,
      justifyContent: 'center',
      backgroundColor: disabled ? darkenColor(bgColor, 40, 50) : bgColor,
      width: buttonWidth ? buttonWidth: 100,
    },
    buttonText: {
      ...Styles.h5,
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