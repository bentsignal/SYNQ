import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Styles } from '@/constants/Styles';
import FastImage from 'react-native-fast-image';
import { Colors } from '@/constants/Colors';
import { getCoverImageData } from '@/lib/SongManager';

export const ListCover = ({image, id, propOnLoad}: {
  image?: string;
  id: string;
  propOnLoad: () => void;
}) => {

  const [src, setSrc] = useState(image ? image : '');
  const [loaded, setLoaded] = useState(false);
  let dim = src ? 60 : 20;

  useEffect(() => {

    const getImage = async () => {
      try {
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
        dim = src ? 60 : 20;
      }
      catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('folder')) {
          console.log('error getting cover image for list cover:', message);
        }
      }
    }

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
      borderRadius: src ? 9 : 0,
    }
  });

  return (
    <View style={Local.container}>
      <FastImage 
        source={src ? {uri: src} : require('@/assets/icons/music.png')}
        style={Local.artwork}
        onLoad={() => {
          setLoaded(true);
          propOnLoad()
        }}
        onError={() => {
          console.log('error loading list cover');
          setSrc('');
          setLoaded(true);
          propOnLoad();
        }}
      />
    </View>
  );

}

export const EditCover = ({image, id, handlePress, propOnLoad}: {
  image?: string; 
  id: string;
  handlePress: () => void;
  propOnLoad: () => void;
}) => {

  const [src, setSrc] = useState(image ? image : '');
  const [loaded, setLoaded] = useState(false);
  const transparent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hPwABAAEAAFPAfXAAAAAElFTkSuQmCC';

  useLayoutEffect(() => {

    const getImage = async () => {
      try {
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
      catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('folder')) {
          console.log('error:  getting cover image for edit modal', message);
        }
      }
    }

    getImage();
    
  }, [image, id]);

  const Local = StyleSheet.create({
    container: {
      backgroundColor: '#D2D2D2',
      width: 120, 
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      opacity: loaded ? 1 : 0
    },
    artwork: {
      width: 120, 
      height: 120,
      position: 'absolute',
      borderRadius: 10,
    },
    tintOverlay: {
      width: 120,
      height: 120,
      position: 'absolute',
      backgroundColor: `rgba(0, 0, 0, ${src ? 0.6 : 0})`,
      borderRadius: 10,
    },
    iconWrapper: {
      width: 120, 
      height: 120,
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
          key={src}
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
            source={src ? require('@/assets/icons/edit.png') : require('@/assets/icons/edit-black.png')}
            style={Local.icon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

}

export const PlayerCover = ({id}: {id: string}) => {

  const [src, setSrc] = useState('');
  const [aspectRatio, setAspectRatio] = useState(1);

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

  const coverPercent = 0.85;

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
      // resizeMode: 'stretch',
      borderRadius: 10,
      // shadowColor: Colors.background,
      // shadowOffset: {
      //   width: 0,
      //   height: 0
      // },
      // shadowOpacity: 0.9,
      // shadowRadius: 20,
    },
    empty: {
      width: 100,
      height: 100,
    }
  });

  return (
    <View style={Local.container}>
      <FastImage 
        source={src ? {uri: src} : require('@/assets/icons/music.png')}
        style={src ? Local.artwork : Local.empty}
      />  
    </View>
  );

}
