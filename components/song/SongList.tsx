import { View, FlatList } from 'react-native'

import Song from '@/components/song/Song'
import Delete from '@/components/modals/Delete'

type ItemData = {
  "name": string;
  "uri": string;
  "data": string;
  "info": {}
};

const renderItem = ({item} : {item: ItemData}) => {
  return (
    <Song 
      name={item.name}
      uri={item.uri}
      data={item.data}
      info={item.info}
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
        width: '100%',
        marginBottom: 10
      }}
    >
      <Delete />
      <FlatList 
        data={data.songs}
        renderItem={renderItem}
        keyExtractor={song => song.name}
        style={{
          width: '100%'
        }}
      />
    </View>
  )
}

export default SongList;