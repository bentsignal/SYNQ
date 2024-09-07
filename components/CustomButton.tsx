import { Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      minWidth: 100,
      height: 42,
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={opacity ? opacity : 0.8}
      style={[customStyles ? customStyles : {}, Local.buttonWrapper, Styles.roundedContainer, {
          backgroundColor: disabled ? disabledColor : background, 
          width: buttonWidth ? buttonWidth: 100,
        }
      ]}
      disabled={disabled}
    >
      <Text style={[Local.buttonText, {
        color: textColor ? textColor: 'black',
      }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

}

export default CustomButton;