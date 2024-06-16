import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'
import { fn } from '@/lib/SongManager'
import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'

const SongInfo = ({info, name}: {
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
  name: string;
}) => {
  if (fn(info) && fn(info.metadata) && fn(info.metadata.name) && fn(info.metadata.artist)) {
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
        >
          {info.metadata.name}
        </Text>
        <Text
          style={{
            color: Colors.text,
            fontWeight: 'medium',
            fontSize: 14,
          }}
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
        >
          {name}
        </Text>
      </View>
    )
  }
}

export default SongInfo