import { StyleProp, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { Styles } from '@/src/constants/Styles';
import { getDisabledColor } from '@/src/lib/color-utils';

type MainButtonProps = {
  title?: string;
  background?: string;
  disabledColor?: string;
  opacity?: number;
  handlePress?: () => void;
  disabled?: boolean;
  buttonWidth?: any;
  textColor?: string;
  customStyles?: StyleProp<ViewStyle>;
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
      minWidth: 100,
      height: 42,
      justifyContent: 'center',
      backgroundColor: disabled ? getDisabledColor(bgColor) : bgColor,
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
      style={[Local.buttonWrapper, customStyles]}
      disabled={disabled}
    >
      <Text style={Local.buttonText}>
        {title}
      </Text>
    </TouchableOpacity>
  );

}

export default CustomButton;
