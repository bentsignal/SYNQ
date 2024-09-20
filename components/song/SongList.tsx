import { View, FlatList, Dimensions, Animated, Easing, NativeSyntheticEvent, NativeScrollEvent, StyleSheet } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Styles } from '@/constants/Styles';
import { SongType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import Song from '@/components/song/Song';
import EditModal from '@/components/modals/EditModal';
import DeleteModal from '@/components/modals/DeleteModal';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

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
  const [atTop, setAtTop] = useState(true);
  const globalOpacityRef = useRef(new Animated.Value(0)).current;
  const topGradientOpacityRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(globalOpacityRef, {
      toValue: 1,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset <= 0 && !atTop) {
      setAtTop(true);
      Animated.timing(topGradientOpacityRef, {
        toValue: 0,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
    else if (yOffset > 5 && atTop) {
      setAtTop(false);
      Animated.timing(topGradientOpacityRef, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }

  const Local = StyleSheet.create({
    container: {
      ...Styles.main,
      paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50,
      opacity: globalOpacityRef,
    },
    list: {
      width: '100%'
    },
    listContent: {
      paddingBottom: 40,
      display: 'flex',
      alignItems: 'center'
    },
    topGradient: {
      position: 'absolute', 
      top: 0, 
      width: '100%', 
      height: 50,
      opacity: topGradientOpacityRef,
    },
    bottomGradient: {
      position: 'absolute', 
      bottom: Dimensions.get('screen').height < 700 ? 70 : 50, 
      width: '100%', 
      height: 50,
    }
  });

  return (
    <>
      <Animated.View style={ Local.container}>
        <EditModal />
        <DeleteModal />
        <FlatList 
          data={data.songs}
          renderItem={renderItem}
          keyExtractor={song => song.id}
          extraData={selectedId}
          onScroll={handleScroll}
          style={Local.list}
          contentContainerStyle={ Local.listContent }
        />
        <AnimatedGradient
          style={ Local.topGradient }
          colors={[ 'rgba(16, 16, 16, 1)', 'rgba(16, 16, 16, 0)']}
          pointerEvents={'none'}
        />
        <LinearGradient
          style={ Local.bottomGradient }
          colors={['rgba(16, 16, 16, 0)', 'rgba(16, 16, 16, 1)']}
          pointerEvents={'none'}
        />
      </Animated.View>
    </>
  );

}

export default SongList;