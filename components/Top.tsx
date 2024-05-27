import { View, Text, Image } from 'react-native'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'

export const Top = () => {
  return (
    <View
      style={{
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 30
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.green,
          }}
        >
          synk
        </Text>
      </View>
      <Image 
        source={require('@/assets/icons/gear.png')}
        style={{
          height: 25,
          width: 25,
        }}
      />
    </View>
  )
}