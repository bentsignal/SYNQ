import { StyleSheet } from 'react-native';
import { useEffect, useState, useRef, memo } from 'react';
import FastImage from 'react-native-fast-image';
import { getAppIcon } from '@/src/constants/Logos';
import { CoverType } from '@/src/constants/Types';
import { useThemeContext } from '@/src/context/ThemeProvider';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const ListCover = memo(({image, type, id, fade, size, empty, propOnLoad}: {
  image?: string;
  type: CoverType;
  id?: number;
  fade?: boolean;
  size?: number;
  empty?: boolean;
  propOnLoad: () => void;
}) => {

  const { theme } = useThemeContext();

  const opacityRef = useSharedValue(fade ? 0 : 1);

  const [loaded, setLoaded] = useState(false);
  const [dim, setDim] = useState(60);

  useEffect(() => {
    if (image || id === -2) {
      setDim(size ??60);
    }
    else {
      setDim(20);
    }
  }, [image, id, size]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityRef.value,
  }));

  const Local = StyleSheet.create({
    container: {
      backgroundColor: empty ? '#D2D2D2' : 'transparent',
      width: size ?? 60,
      height: size ?? 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: type === CoverType.ARTIST ? 100 : 10,
      opacity: loaded ? 1 : 0,
      overflow: 'hidden',
    },
    artwork: {
      width: dim, 
      height: dim,
      borderRadius: image || id === -2 ? 9 : 0,
    }
  });

  const getSource = () => {
    if (id === -2) {
      return (getAppIcon(theme));
    }
    else if (image) {
      return {uri: `${image}`};
    }
    else if (empty) {
      if (type === CoverType.SONG) {
        return require('@/src/assets/icons/music.png');
      }
      else if (type === CoverType.PLAYLIST) {
        if (id === 2) {
          return require('@/src/assets/icons/heart.png');
        }
        else {
          return require('@/src/assets/icons/cassette-tape.png');
        }
      }
      else if (type === CoverType.ALBUM) {
        return require('@/src/assets/icons/cd-drive.png');
      }
      else if (type === CoverType.ARTIST) {
        return require('@/src/assets/icons/user.png');
      }
      else {
        return require('@/src/assets/icons/music.png');
      }
    }
    else {
      return {uri: 'transparent'};
    }
  }

  return (
    <Animated.View style={[Local.container, animatedStyle]}>
      <FastImage
        source={getSource()}
        style={Local.artwork}
        onLoad={() => {
          setLoaded(true);
          if (fade) {
            opacityRef.value = withTiming(1, { duration: 300 });
          }
          propOnLoad();
        }}
        onError={() => {
          setLoaded(true);
          propOnLoad();
        }}
      />
    </Animated.View>
  );

});

ListCover.displayName = "ListCover";

export default ListCover;
