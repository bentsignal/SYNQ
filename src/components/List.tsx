import { FlatList, Dimensions, Animated, Easing, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, ListRenderItem } from 'react-native';
import React, { useRef, useEffect, useState, memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Styles } from '@/src/constants/Styles';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const List = memo((
  {
    data, 
    headerComponent, 
    footerComponent,
    bottomPadding = false,
    item,
    keyExtractor,
    extra,
    setScrollPosition,
    hideTopGradient = false,
    hideBottomGradient = false,
    gradientStart,
    gradientEnd,
    emptyComponent,
    showEmptyComponent = true,
    lockScroll = false,
    listRef,
  }: 
  {
    data: any[], 
    headerComponent?: React.ReactNode,
    footerComponent?: React.ReactNode,
    bottomPadding?: boolean,
    item: ListRenderItem<any>,
    keyExtractor: (item: any, index: number) => string,
    extra?: any,
    setScrollPosition?: (position: number) => void,
    hideTopGradient?: boolean,
    hideBottomGradient?: boolean,
    gradientStart?: string,
    gradientEnd?: string,
    emptyComponent?: React.ReactNode,
    showEmptyComponent?: boolean,
    lockScroll?: boolean,
    listRef?: React.RefObject<FlatList<any>>,
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
    if (yOffset <= 0 && !atTop && !hideTopGradient) {
      setAtTop(true);
      Animated.timing(topGradientOpacityRef, {
        toValue: 0,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
    else if (yOffset > 0 && atTop && !hideTopGradient) {
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
      display: hideTopGradient ? 'none' : 'flex',
    },
    bottomGradient: {
      position: 'absolute', 
      bottom: bottomPadding ? (Dimensions.get('screen').height < 700 ? 70 : 50) : 0, 
      width: '100%', 
      height: 50,
      display: hideBottomGradient ? 'none' : 'flex',
    }
  });

  return (
    <>
      <Animated.View style={ Local.container}>
        <FlatList
          ref={listRef}
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
          windowSize={21}
          onEndReachedThreshold={0.5}
          ListFooterComponent={footerComponent ? <>{footerComponent}</> : null}
          ListEmptyComponent={showEmptyComponent && emptyComponent ? <>{emptyComponent}</> : null}
          scrollEnabled={!lockScroll}
        />
        <AnimatedGradient
          style={ Local.topGradient }
          colors={[ gradientStart || 'rgba(20, 20, 20, 1)', gradientEnd || 'rgba(20, 20, 20, 0)']}
          pointerEvents={'none'}
        />
        <LinearGradient
          style={ Local.bottomGradient }
          colors={[ gradientEnd || 'rgba(20, 20, 20, 0)', gradientStart || 'rgba(20, 20, 20, 1)']}
          pointerEvents={'none'}
        />
      </Animated.View>
    </>
  );

});

export default List;
