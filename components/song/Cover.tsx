import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import CustomButton from '@/components/CustomButton'

const NoCover = () => {
  return (
    <View style={{
      backgroundColor: '#D2D2D2',
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Image 
        source={require('@/assets/icons/music.png')}
        style={{
          width: 20,
          height: 20
        }}
      />
    </View>
  )
}

const Cover = (info: any) => {
  
  if (Object.hasOwn(info, 'tags') && Object.hasOwn(info.tags, 'metadata') && Object.hasOwn(info.tags.metadata, 'artwork')) {
    return (
      <Image 
        source={info.tags.metadata.artwork}
        style={{
          width: 60,
          height: 60
        }}
      />
    )
  }
  else {
    return (
      <NoCover />
    )
  }
}

export default Cover