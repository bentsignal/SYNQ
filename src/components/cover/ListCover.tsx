import { StyleSheet, Animated } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import FastImage from 'react-native-fast-image';
import { getAppIcon } from '@/src/constants/Logos';
import { CoverType } from '@/src/constants/Types';
import { useThemeContext } from '@/src/context/ThemeProvider';

const ListCover = ({image, type, id, fade, propOnLoad}: {
  image?: string;
  type: CoverType;
  id?: string;
  fade?: boolean;
  propOnLoad: () => void;
}) => {

  const { theme } = useThemeContext();

  const opacityRef = useRef(new Animated.Value(fade ? 0 : 1)).current;

  const [src, setSrc] = useState(image ? image : '');
  const [loaded, setLoaded] = useState(false);
  let dim = image || id === 'ad' ? 60 : 20;

  const Local = StyleSheet.create({
    container: {
      backgroundColor: src ? 'transparent' : '#D2D2D2',
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: type === CoverType.ARTIST ? 100 : 10,
      opacity: loaded ? 1 : 0,
      overflow: 'hidden',
    },
    artwork: {
      width: dim, 
      height: dim,
      borderRadius: src || id === 'ad' ? 9 : 0,
    }
  });

  const getSource = () => {
    if (id === 'ad') {
      return (getAppIcon(theme));
    }
    else if (image) {
      return {uri: `${image}`};
    }
    else if (type === CoverType.PLAYLIST) {
      if (id === '2') {
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

  return (
    <Animated.View style={[Local.container, {opacity: opacityRef}]}>
      <FastImage
        source={getSource()}
        style={Local.artwork}
        onLoad={() => {
          setLoaded(true);
          if (fade) {
            Animated.timing(opacityRef, {
              toValue: 1,
              duration: 300,
              useNativeDriver: false,
            }).start();
          }
          propOnLoad()
        }}
        onError={() => {
          console.log('error loading list cover');
          setSrc('');
          setLoaded(true);
          propOnLoad();
        }}
      />
    </Animated.View>
  );

}

export default ListCover;