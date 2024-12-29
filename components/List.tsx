import { FlatList, Dimensions, Animated, Easing, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, ListRenderItem } from 'react-native';
import React, { useRef, useEffect, useState, memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Styles } from '@/constants/Styles';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const List = memo((
  {
    data, 
    headerComponent, 
    bottomPadding = false,
    item,
    keyExtractor,
    extra,
    setScrollPosition,
    gradientStart,
    gradientEnd,
  }: 
  {
    data: any[], 
    headerComponent?: React.ReactNode,
    bottomPadding?: boolean,
    item: ListRenderItem<any>,
    keyExtractor: (item: any, index: number) => string,
    extra?: any,
    setScrollPosition?: (position: number) => void,
    gradientStart?: string,
    gradientEnd?: string,
  }
) => {

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
    if (setScrollPosition) {
      setScrollPosition(yOffset);
    }
    if (yOffset <= 0 && !atTop) {
      setAtTop(true);
      Animated.timing(topGradientOpacityRef, {
        toValue: 0,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
    else if (yOffset > 0 && atTop) {
      setAtTop(false);
      Animated.timing(topGradientOpacityRef, {
        toValue: 1,
        duration: 100,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }

  const Local = StyleSheet.create({
    container: {
      ...Styles.main,
      paddingBottom: bottomPadding ? (Dimensions.get('screen').height < 700 ? 70 : 50) : 0,
      opacity: globalOpacityRef,
    },
    list: {
      width: '100%'
    },
    listContent: {
      paddingBottom: 100,
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
      bottom: bottomPadding ? (Dimensions.get('screen').height < 700 ? 70 : 50) : 0, 
      width: '100%', 
      height: 50,
    }
  });

  return (
    <>
      <Animated.View style={ Local.container}>
        <FlatList 
          data={data}
          renderItem={item}
          keyExtractor={keyExtractor}
          extraData={extra}
          onScroll={handleScroll}
          style={Local.list}
          ListHeaderComponent={headerComponent ? <>{headerComponent}</> : null}
          ListHeaderComponentStyle={{width: '90%'}}
          contentContainerStyle={ Local.listContent }
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          windowSize={10}
        />
        <AnimatedGradient
          style={ Local.topGradient }
          colors={[ gradientStart || 'rgba(16, 16, 16, 1)', gradientEnd || 'rgba(16, 16, 16, 0)']}
          pointerEvents={'none'}
        />
        <LinearGradient
          style={ Local.bottomGradient }
          colors={[ gradientEnd || 'rgba(16, 16, 16, 0)', gradientStart || 'rgba(16, 16, 16, 1)']}
          pointerEvents={'none'}
        />
      </Animated.View>
    </>
  );

});

export default List;
