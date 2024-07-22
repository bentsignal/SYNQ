import { Text, View, Image, TouchableOpacity, ImageSourcePropType } from 'react-native'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'

type ImportInstructionsProps = {
  title: string;
  desc: string;
  icon: ImageSourcePropType;
  disabled?: boolean;
  handlePress: () => void;
}

const ImportInstructions = ({
  title,
  desc,
  icon,
  disabled,
  handlePress
}:ImportInstructionsProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={disabled ? 1 : .9}
      style={[Styles.roundedContainer, {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        backgroundColor: disabled ? Colors.disabled : Colors.main,
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
            fontSize: 16,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold'
          }}
        >
          {desc}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default ImportInstructions;