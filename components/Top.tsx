import { View, Text, Image } from 'react-native'
import { Styles } from '@/constants/Styles'

const Top = () => {
  return (
    <View style={Styles.top}>
      <View>
        <Text style={Styles.appName}>
          cynk
        </Text>
      </View>
      <Image 
        source={require('@/assets/icons/synk.png')}
        style={{
          height: 25,
          width: 25,
        }}
      />
    </View>
  )
}

export default Top;