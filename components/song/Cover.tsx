import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';

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
      if (image?.includes('file://')) {
        try {
          const contents = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}library/${id}`);
          if (contents.includes('cover_small.jpg')) {
            const data = await FileSystem.readAsStringAsync(`${FileSystem.documentDirectory}library/${id}/cover_small.jpg`, { encoding: 'base64' });
            setSrc(`data:image/jpeg;base64,${data}`);
          }
        }
        catch (error) {
          console.log(error);
          setSrc('');
        }
      }
      else {
        setSrc(image ? image : '');
      }
      dim = src ? 60 : 20;
    }

    getImage();
    
  }, [image]);

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
      <Image 
        source={src ? {uri: src} : require('@/assets/icons/music.png')}
        style={Local.artwork}
        onLoad={() => {
          setLoaded(true);
          propOnLoad()
        }}
        onError={(error) => {
          console.log('error loading list cover: ', error);
          setSrc('');
          setLoaded(true);
          propOnLoad();
        }}
      />
    </View>
  );

}

export const EditCover = ({image, handlePress}: {
  image?: string; 
  handlePress?: () => void;
}) => {

  const [src, setSrc] = useState(image ? image : '');
  const transparent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hPwABAAEAAFPAfXAAAAAElFTkSuQmCC';

  useEffect(() => {
    setSrc(image ? image : '')
  }, [image]);

  const Local = StyleSheet.create({
    container: {
      backgroundColor: '#D2D2D2',
      width: 120, 
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
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
        <Image 
          source={src ? {uri: src} : {uri: transparent}}
          style={Local.artwork}
          onError={() => setSrc('')}
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
