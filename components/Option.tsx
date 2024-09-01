import { Text, View, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { darkenColor } from '@/lib/ColorManager';
import { useGlobalContext } from '@/context/GlobalProvider';

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

  const { theme } = useGlobalContext();

  const color = bg ? bg : theme;

  return (
    <TouchableOpacity
      onPress={disabled ? () => {} : handlePress}
      activeOpacity={disabled ? 1 : 0.9}
      style={[Styles.roundedContainer, {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        backgroundColor: disabled ? darkenColor(color, 40, 50) : color,
        padding: 20,
        marginBottom: 10
      }]}
    >
      <Image 
        source={icon} 
        style={{
          width: 36,
          height: 36,
          marginRight: 16
        }}
      />
      <View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold'
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 16
          }}
        >
          {desc}
        </Text>
      </View>
    </TouchableOpacity>
  );

}

export default Option;