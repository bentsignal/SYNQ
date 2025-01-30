import { Text, View, Image, TouchableOpacity, ImageSourcePropType, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { Styles } from '@/src/constants/Styles';
import { darkenColor } from '@/src/controllers/ColorController';
import { useThemeContext } from '@/src/context/ThemeProvider';
import Arrow from './Arrow';

type ImportOptionProps = {
  title: string;
  desc: string;
  icon: ImageSourcePropType;
  disabled: boolean;
  bg?: string;
  iconTint?: string;
  handlePress: () => void;
};

const Option = ({
  title,
  desc,
  icon,
  disabled,
  bg,
  iconTint,
  handlePress
} : ImportOptionProps) => {

  const { theme } = useThemeContext();

  const color = bg ? bg : Colors.song;

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
      marginRight: 16,
      tintColor: iconTint ? iconTint : Colors.text
    },
    title: {
      ...Styles.h4,
      color: Colors.text
    },
    desc: {
      ...Styles.p,
      color: Colors.infoText
    },
    arrowContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      marginRight: 5,
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
        <Text style={Local.title}>
          {title}
        </Text>
        <Text style={Local.desc}>
          {desc}
        </Text>
      </View>
      <View style={Local.arrowContainer}>
        <Arrow
          containerStyle={{transform: [ {rotate: '135deg'}]}}
          arrowStyle={{backgroundColor: Colors.text}}
          arrowLength={10}
          arrowWidth={2}
        />
      </View>
    </TouchableOpacity>
  );

}

export default Option;