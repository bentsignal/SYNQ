import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'
import { fn } from '@/lib/SongManager'
import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import { InfoType } from '@/constants/Types'

const SongInfo = ({info, name}: {
  "info": InfoType
  name: string;
}) => {
  if (info.metadata?.artist && info.metadata?.name) {
    return (
      <View
        style={{
          flex: 1,
          paddingLeft: 10,
          flexGrow: 1
        }}
      >
        <Text
          style={{
            color: Colors.text,
            fontWeight: 'bold',
            fontSize: 16,
          }}
          numberOfLines={1}
        >
          {info.metadata.name}
        </Text>
        <Text
          style={{
            color: Colors.text,
            fontWeight: 'medium',
            fontSize: 14,
          }}
          numberOfLines={1}
        >
          {info.metadata.artist}
        </Text>
      </View>
    )
  }
  else {
    return (
      <View
        style={{
          flex: 1,
          paddingLeft: 10,
          flexGrow: 1
        }}
      >
        <Text
          style={{
            color: Colors.text,
            fontWeight: 'bold',
            fontSize: 16,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
    )
  }
}

export default SongInfo