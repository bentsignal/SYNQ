import { View, ScrollView, Animated, NativeSyntheticEvent, NativeScrollEvent, Easing, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { useRef, useState } from 'react';
import { hexToRGB } from '@/lib/ColorManager';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type VerticalScrollViewProps = {
  children: React.ReactNode;
  backgroundColor?: string;
  maxHeight?: any;
  minHeight?: any;
}

const VerticalScrollView = ({ children, backgroundColor, maxHeight, minHeight }: VerticalScrollViewProps) => {

  const topGradientOpacityRef = useRef(new Animated.Value(0)).current;
  
  const [atTop, setAtTop] = useState(true);

  const RGB = hexToRGB(backgroundColor ? backgroundColor : Colors.background);
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

  const Local = StyleSheet.create({
    container: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    gradient: {
      position: 'absolute', 
      width: '100%', 
      height: 50,
      zIndex: 5,
    },
    topGradient: {
      top: 0,
      opacity: topGradientOpacityRef,
    },
    bottomGradient: {
      bottom: -1,
      opacity: 1,
    },
    scrollView: {
      width: '100%',
      maxHeight: maxHeight ? maxHeight : '70%',
      minHeight: minHeight ? minHeight : '0',
    },
    contentWrapper: {
      alignItems: 'center',
    }
  });

  return (
    <View style={Local.container}>
      <AnimatedGradient
        style={[Local.gradient, Local.topGradient]}
        colors={[ `rgba(${R}, ${G}, ${B}, 1)`, `rgba(${R}, ${G}, ${B}, 0)` ]}
        pointerEvents={'none'}
      />
      <ScrollView
        onScroll={handleScroll}
        style={Local.scrollView}
        contentContainerStyle={Local.contentWrapper}
      >
        {children}
      </ScrollView>
      <AnimatedGradient
        style={[Local.gradient, Local.bottomGradient]}
        colors={[ `rgba(${R}, ${G}, ${B}, 0)`, `rgba(${R}, ${G}, ${B}, 1)` ]}
        pointerEvents={'none'}
      />
    </View>
  );

}

export default VerticalScrollView;