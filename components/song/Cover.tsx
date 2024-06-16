import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import CustomButton from '@/components/CustomButton'
import { fn } from '@/lib/SongManager'

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

const Cover = (info: {
  "info": {
    "fileType"?: string;
    "format"?: string;
    "metadata"?: {
      "album"?: string;
      "artist"?: string;
      "artwork"?: string;
      "name"?: string;
    }
  };
}) => {
  if (fn(info) && fn(info.metadata) && fn(info.metadata.artwork)) {
    return (
      <Image 
        source={info.metadata.artwork}
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