import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import FastImage from 'react-native-fast-image';
import { getCoverImageData } from '@/lib/SongManager';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import Ad from '@/components/Ad';
import { getAppIcon } from '@/constants/Logos';
import { PageType, CoverType } from '@/constants/Types';
import { useThemeContext } from '@/context/ThemeProvider';
import { getPlaylistCover } from '@/lib/PlaylistManager';

const transparent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hPwABAAEAAFPAfXAAAAAElFTkSuQmCC';


export const ListCover = ({image, type, id, fade, propOnLoad}: {
  image?: string;
  type: CoverType;
  id: string;
  fade?: boolean;
  propOnLoad: () => void;
}) => {

  const { numModified, editSong, adPlaying } = useGlobalContext();
  const { theme } = useThemeContext();

  const opacityRef = useRef(new Animated.Value(fade ? 0 : 1)).current;

  const [src, setSrc] = useState(image ? image : '');
  const [loaded, setLoaded] = useState(false);
  let dim = src || id === 'ad' ? 60 : 20;

  const getImage = async () => {
    try {
      if (type === CoverType.SONG) {
        if (image) {
          setSrc(image);
        }
        else {
          const data = await getCoverImageData(id);
          if (data) {
            setSrc(`data:image/jpeg;base64,${data}`);
          }
          else {
            setSrc('');
          }
        }
      }
      else if (type === CoverType.PLAYLIST) {
        const data = await getPlaylistCover(parseInt(id), true);
        if (data) {
          setSrc(`data:image/jpeg;base64,${data}`);
        }
      }
      dim = src ? 60 : 20;
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('folder')) {
        console.log('error getting cover image for list cover:', message);
      }
    }
  }

  useEffect(() => {
    if (id && editSong.id && editSong.id === id) {
      getImage();
    }
  }, [numModified])

  useEffect(() => {

    getImage();
    
  }, [image, id]);

  const Local = StyleSheet.create({
    container: {
      backgroundColor: '#D2D2D2',
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      opacity: loaded ? 1 : 0
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
    else if (src) {
      return {uri: src};
    }
    else if (type === CoverType.PLAYLIST) {
      if (id === '1') {
        return require('@/assets/icons/library.png');
      }
      else {
        return require('@/assets/icons/cassette-tape.png');
      }
    }
    else if (type === CoverType.ALBUM) {
      return require('@/assets/icons/cd-drive.png');
    }
    else {
      return require('@/assets/icons/music.png');
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

export const EditCover = ({image, id, type, handlePress, propOnLoad}: {
  image?: string; 
  id?: string;
  type: CoverType;
  handlePress: () => void;
  propOnLoad: () => void;
}) => {

  const [src, setSrc] = useState(image ? image : transparent);
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {

    const getImage = async () => {
      try {
        if (type === CoverType.SONG) {
          if (image) {
            setSrc(image);
          }
          else {
            const data = await getCoverImageData(id);
            if (data) {
              setSrc(`data:image/jpeg;base64,${data}`);
            }
            else {
              setSrc(transparent);
            }
          }
        }
        else if (type === CoverType.PLAYLIST) {
          if (image) {
            setSrc(image);
          }
          else {
            const data = await getPlaylistCover(parseInt(id));
            if (data) {
              setSrc(`data:image/jpeg;base64,${data}`);
            }
            else {
              setSrc(transparent);
            }
          }
        }
      }
      catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('folder')) {
          console.log('error getting cover image for edit cover:', message);
        }
      }
    }

    getImage();
    
  }, [image, id]);

  const editCoverSize = 140;

  const Local = StyleSheet.create({
    container: {
      backgroundColor: '#D2D2D2',
      width: editCoverSize, 
      height: editCoverSize,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      opacity: loaded ? 1 : 0
    },
    artwork: {
      width: editCoverSize, 
      height: editCoverSize,
      position: 'absolute',
      borderRadius: 10,
    },
    tintOverlay: {
      width: editCoverSize,
      height: editCoverSize,
      position: 'absolute',
      backgroundColor: `rgba(0, 0, 0, ${src === transparent ? 0 : 0.6})`,
      borderRadius: 10,
    },
    iconWrapper: {
      width: editCoverSize, 
      height: editCoverSize,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center'
    },
    icon: {
      width: 20,
      height: 20,
    }
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
    >
      <View style={Local.container}>
        <FastImage 
          source={src ? {uri: src} : {uri: transparent}}
          style={Local.artwork}
          onLoad={() => {
            setLoaded(true);
            propOnLoad();
          }}
          onError={() => {
            setSrc('');
            setLoaded(true);
            propOnLoad();
          }}
        />
        <View style={Local.tintOverlay}/>
        <View style={Local.iconWrapper}>
          <Image 
            source={src === transparent ? require('@/assets/icons/edit-black.png') : require('@/assets/icons/edit.png')}
            style={Local.icon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

}

export const SongListPageCover = ({id, type}: {id: string, type: PageType}) => {

  const [src, setSrc] = useState('');
  const [aspectRatio, setAspectRatio] = useState(1);
  const { theme } = useThemeContext();
  const coverPercent = 0.65;

  useEffect(() => {
    
    const getImage = async () => {
      try {
        if (type === PageType.PLAYLIST) {
          const data = await getPlaylistCover(parseInt(id), true);
          if (data) {
            console.log('here');
            setSrc(`data:image/jpeg;base64,${data}`);
          }
        }
      }
      catch (error) {
        console.log('error getting cover image for player: ', error);
      }
    }
    
    getImage();

  }, [id]);

  const Local = StyleSheet.create({
    container: {
      backgroundColor: src ? 'transparent' : '#D2D2D2',
      width: Dimensions.get('screen').width * coverPercent, 
      minHeight: Dimensions.get('screen').width * coverPercent,
      aspectRatio: aspectRatio,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    artwork: {
      aspectRatio: aspectRatio,
      width: Dimensions.get('screen').width * coverPercent, 
      borderRadius: 10,
    },
    empty: {
      width: 60,
      height: 60,
    },
  });

  const getSource = () => {
    if (src) {
      return {uri: src};
    }
    else if (type === PageType.PLAYLIST && id === '1') {
      return require('@/assets/icons/library.png');
    }
    else if (type === PageType.PLAYLIST) {
      return require('@/assets/icons/cassette-tape.png');
    }
    else if (type === PageType.ALBUM) {
      return require('@/assets/icons/cd-drive.png');
    }
    else {
      return require('@/assets/icons/music.png');
    }
  }

  const getStyle = () => {
    if (src) {
      return Local.artwork;
    }
    else {
      return Local.empty;
    }
  }

  return (
    <View style={Local.container}>
      <FastImage 
        source={getSource()}
        style={getStyle()}
      />  
    </View>
  );

}

export const PlayerCover = ({id}: {id: string}) => {

  const [src, setSrc] = useState('');
  const [aspectRatio, setAspectRatio] = useState(1);
  const { adPlaying } = useGlobalContext();
  const { theme } = useThemeContext();
  const coverPercent = 0.85;

  useEffect(() => {
    
    const getImage = async () => {
      try {
        const data = await getCoverImageData(id, true);
        if (data) {
          Image.getSize(`data:image/jpeg;base64,${data}`, (width, height) => {
            setAspectRatio(width / height);
          });
          setSrc(`data:image/jpeg;base64,${data}`);
        }
        else {
          setAspectRatio(1);
          setSrc('');
        }
      }
      catch (error) {
        console.log('error getting cover image for player: ', error);
      }
    }
    
    getImage();

  }, [id]);

  const Local = StyleSheet.create({
    container: {
      backgroundColor: src ? 'transparent' : '#D2D2D2',
      width: Dimensions.get('screen').width * coverPercent, 
      minHeight: Dimensions.get('screen').width * coverPercent,
      aspectRatio: aspectRatio,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    artwork: {
      aspectRatio: aspectRatio,
      width: Dimensions.get('screen').width * coverPercent, 
      borderRadius: 10,
      display: adPlaying ? 'none' : 'flex',
    },
    empty: {
      width: 100,
      height: 100,
      display: adPlaying ? 'none' : 'flex',
    },
    adContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: Colors.background,
      display: adPlaying ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    }
  });

  const getSource = () => {
    if (adPlaying) {
      return {uri: transparent}
    }
    if (src) {
      return {uri: src};
    }
    else {
      return require('@/assets/icons/music.png');
    }
  }

  const getStyle = () => {
    if (src) {
      return Local.artwork;
    }
    else {
      return Local.empty;
    }
  }

  const getAdMessage = () => {
    return (
      <Text>
        Listen to your music ad-free with 
        <Text style={{color: theme}}>
          {' '}Premium
        </Text>
      </Text>
    );
  }

  return (
    <View style={Local.container}>
      <View style={Local.adContainer}>
        <Ad message={getAdMessage()}/>
      </View>
      <FastImage 
        source={getSource()}
        style={getStyle()}
      />  
    </View>
  );

}
