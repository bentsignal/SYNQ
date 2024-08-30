import { View, ScrollView, Animated, NativeSyntheticEvent, NativeScrollEvent, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { useRef, useState } from 'react';
import { hexToRGB } from '@/lib/Color';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type VerticalScrollViewProps = {
  children: React.ReactNode;
  backgroundColor: string;
  maxHeight?: any;
  minHeight?: any;
}

const VerticalScrollView = ({ children, backgroundColor, maxHeight, minHeight }: VerticalScrollViewProps) => {

  const topGradientOpacityRef = useRef(new Animated.Value(0)).current;
  
  const [atTop, setAtTop] = useState(true);

  const RGB = hexToRGB(backgroundColor);
  const R = RGB ? RGB.r : 16;
  const G = RGB ? RGB.g : 16;
  const B = RGB ? RGB.b : 16;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {

    const yOffset = event.nativeEvent.contentOffset.y;

    if (yOffset <= 5 && !atTop) {
      setAtTop(true);
      Animated.timing(topGradientOpacityRef, {
        toValue: 0,
        duration: 200,
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

  return (
    <View
      style={{
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <AnimatedGradient
        style={{
          position: 'absolute', 
          top: 0, 
          width: '100%', 
          height: 50,
          opacity: topGradientOpacityRef,
          zIndex: 5,
        }}
        colors={[ `rgba(${R}, ${G}, ${B}, 1)`, `rgba(${R}, ${G}, ${B}, 0)` ]}
        pointerEvents={'none'}
      />
      <ScrollView
        onScroll={handleScroll}
        style={{
          width: '100%',
          maxHeight: maxHeight ? maxHeight : '70%',
          minHeight: minHeight ? maxHeight : '0',
        }}
        contentContainerStyle={{
          alignItems: 'center',
        }}
      >
        {children}
      </ScrollView>
      <AnimatedGradient
        style={{
          position: 'absolute', 
          bottom: -1, 
          width: '100%', 
          height: 50,
          opacity: 1,
        }}
        colors={[ `rgba(${R}, ${G}, ${B}, 0)`, `rgba(${R}, ${G}, ${B}, 1)` ]}
        pointerEvents={'none'}
      />
    </View>
  );

}

export default VerticalScrollView;