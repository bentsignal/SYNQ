import { Text, View, Image, TouchableOpacity, ImageSourcePropType } from 'react-native'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'

type ImportOptionProps = {
  title: string;
  desc: string;
  icon: ImageSourcePropType;
  disabled: boolean;
  bg?: string;
  handlePress: () => void;
}

const Option = ({
  title,
  desc,
  icon,
  disabled,
  bg,
  handlePress
}:ImportOptionProps) => {
  const color = bg ? bg : Colors.main
  return (
    <TouchableOpacity
      onPress={disabled ? () => {} : handlePress}
      activeOpacity={0.9}
      style={[Styles.roundedContainer, {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: disabled ? Colors.disabled : color,
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
  )
}

export default Option;