import { View, FlatList, Dimensions, Animated, Easing} from 'react-native';
import { useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Styles } from '@/constants/Styles';
import { SongType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import Song from '@/components/song/Song';
import EditModal from '@/components/modals/EditModal';
import DeleteModal from '@/components/modals/DeleteModal';

const renderItem = ({item} : {item: SongType}) => {
  return (
    <Song 
      name={item.name}
      id={item.id}
      data={item.data}
      info={item.info}
    />
  );
}

const SongList = (data: any) => {

  const { selectedId } = useGlobalContext();

  const opacityRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityRef, {
      toValue: 1,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[Styles.main, {
        paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50,
        opacity: opacityRef,
      }]}
    >
      <EditModal />
      <DeleteModal />
      <FlatList 
        data={data.songs}
        renderItem={renderItem}
        keyExtractor={song => song.id}
        extraData={selectedId}
        style={{
          width: '100%'
        }}
        contentContainerStyle={{
          paddingBottom: 40,
          display: 'flex',
          alignItems: 'center'
        }}
      />
      <LinearGradient
        style={{
          position: 'absolute', 
          bottom: Dimensions.get('screen').height < 700 ? 70 : 50, 
          width: '100%', 
          height: 50,
        }}
        colors={['rgba(16, 16, 16, 0)', 'rgba(16, 16, 16, 1)']}
        pointerEvents={'none'}
      />
    </Animated.View>
  );

}

export default SongList;