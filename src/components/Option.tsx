import { Text, View, Image, TouchableOpacity, ImageSourcePropType, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { Styles } from '@/src/constants/Styles';
import { darkenColor } from '@/src/controllers/ColorController';
import { useThemeContext } from '@/src/context/ThemeProvider';

type ImportOptionProps = {
  title: string;
  desc: string;
  icon: ImageSourcePropType;
  disabled: boolean;
  bg?: string;
  handlePress: () => void;
};

const Option = ({
  title,
  desc,
  icon,
  disabled,
  bg,
  handlePress
} : ImportOptionProps) => {

  const { theme } = useThemeContext();

  const color = bg ? bg : theme;

  const Local = StyleSheet.create({
    container: {
      ...Styles.roundedContainer,
      flexDirection: 'row',
      alignItems: 'center',
      width: '90%',
      backgroundColor: disabled ? darkenColor(color, 40, 50) : color,
      padding: 20,
      marginBottom: 10
    },
    icon: {
      width: 36,
      height: 36,
      marginRight: 16
    }
  });

  return (
    <TouchableOpacity
      onPress={disabled ? () => {} : handlePress}
      activeOpacity={disabled ? 1 : 0.9}
      style={Local.container}
    >
      <Image 
        source={icon} 
        style={Local.icon}
      />
      <View>
        <Text style={Styles.h4}>
          {title}
        </Text>
        <Text style={Styles.p}>
          {desc}
        </Text>
      </View>
    </TouchableOpacity>
  );

}

export default Option;