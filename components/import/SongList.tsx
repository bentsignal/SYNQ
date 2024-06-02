import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'
import * as FileSystem from 'expo-file-system'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import CustomButton from '../CustomButton'

type SongProps = {
  name: string;
  uri: string;
};

const Song = ({name, uri}: SongProps) => {
  return (
    <View>
      <Text
        style={{
          color: 'white'
        }}
      >
        {name}
      </Text>
    </View>
  )
}

type ItemData = {
  "mimeType": string;
  "name": string;
  "size": Int16Array;
  "uri": string;
};

const renderItem = ({item} : {item: ItemData}) => {
  return (
    <Song 
      name={item.name}
      uri={item.uri}
    />
  )
}

const SongList = (data: any) => {
  return (
    <View
      style={{
        alignSelf: 'stretch',
        alignItems: 'center',
        height: '75%',
        marginBottom: 10
      }}
    >
      <FlatList 
        data={data.songs}
        renderItem={renderItem}
        keyExtractor={song => song.name}
      />
    </View>
  )
}

export default SongList;