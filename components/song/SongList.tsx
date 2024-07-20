import { View, FlatList, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';

import { Styles } from '@/constants/Styles'

import { SongType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import Song from '@/components/song/Song'
import DeleteModal from '@/components/modals/DeleteModal'
import EditModal from '@/components/modals/EditModal'

const renderItem = ({item} : {item: SongType}) => {
  return (
    <Song 
      name={item.name}
      id={item.id}
      data={item.data}
      info={item.info}
    />
  )
}

const SongList = (data: any) => {
  const { selectedId } = useGlobalContext();
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
        keyExtractor={song => song.id}
        extraData={selectedId}
        style={{
          width: '100%',
          paddingRight: 10,
        }}
        contentContainerStyle={{
          paddingBottom: 40
        }}
      />
      <LinearGradient
        style={{position:'absolute', bottom:Dimensions.get('screen').height < 700 ? 70 : 50, width:'100%', height:50}}
        colors={['rgba(16, 16, 16, 0)', 'rgba(16, 16, 16, 1)']}
        pointerEvents={'none'}
      />
    </View>
  )
}

export default SongList;