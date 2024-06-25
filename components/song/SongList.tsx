import { View, FlatList, Dimensions } from 'react-native'

import { Styles } from '@/constants/Styles'

import Song, { SongProps } from '@/components/song/Song'
import DeleteModal from '@/components/modals/Delete'
import EditModal from '@/components/modals/Edit'

const renderItem = ({item} : {item: SongProps}) => {
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
      style={[Styles.main, {
        paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
      }]}
    >
      <DeleteModal />
      <EditModal />
      <FlatList 
        data={data.songs}
        renderItem={renderItem}
        keyExtractor={song => song.name}
        style={{
          width: '100%',
          paddingRight: 5
        }}
      />
    </View>
  )
}

export default SongList;