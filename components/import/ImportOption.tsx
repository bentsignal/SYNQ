import { Text, View, Image, TouchableOpacity, ImageSourcePropType } from 'react-native'
import { Colors } from '@/constants/Colors'

type ImportOptionProps = {
  title: string;
  desc: string;
  icon: ImageSourcePropType;
  disabled: boolean;
  handlePress: () => void;
}

const ImportOption = ({
  title,
  desc,
  icon,
  disabled,
  handlePress
}:ImportOptionProps) => {
  return (
    <TouchableOpacity
      onPress={disabled ? () => {} : handlePress}
      activeOpacity={1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: disabled ? Colors.disabled : Colors.main,
        borderRadius: 10,
        padding: 20,
        marginBottom: 10
      }}
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

export default ImportOption;