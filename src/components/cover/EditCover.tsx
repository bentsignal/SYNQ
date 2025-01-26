import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import FastImage from 'react-native-fast-image';
import { getSongCover } from '@/src/controllers/ImageController';
import { PageType, CoverType } from '@/src/constants/Types';
import { getPlaylistCover } from '@/src/controllers/PlaylistController';
import { getArtistCover } from '@/src/controllers/ArtistController';
import { getAlbumCover, getAlbumCoverFromSong } from '@/src/controllers/AlbumController';
import albumBus from '@/src/events/album/Bus';
import { AlbumBusEvent } from '@/src/events/album/Events';

const transparent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hPwABAAEAAFPAfXAAAAAElFTkSuQmCC';

const EditCover = ({image, id, type, handlePress, propOnLoad}: {
  image?: string; 
  id?: number;
  type: CoverType;
  handlePress: () => void;
  propOnLoad: () => void;
}) => {

  const opacityRef = useRef(new Animated.Value(0)).current;
  const [src, setSrc] = useState(image ? image : transparent);
  const [loaded, setLoaded] = useState(false);

  const revealImage = () => {
    Animated.timing(opacityRef, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }

  const getImage = async () => {
    try {
      if (type === CoverType.SONG) {
        if (image) {
          setTimeout(() => {
            setSrc(image);
          }, 20);
        }
        else {
          const path = await getAlbumCoverFromSong(id);
          if (path) {
            setSrc(path);
          }
          else {
            const path = await getSongCover(id);
            if (path) {
              setSrc(path);
            }
            else {
              setSrc(transparent);
            }
          }
        }
      }
      else if (type === CoverType.PLAYLIST) {
        if (image) {
          setSrc(image);
        }
        else {
          const path = await getPlaylistCover(id);
          if (path) {
            setSrc(path);
          }
          else {
            setSrc(transparent);
          }
        }
      }
      else if (type === CoverType.ARTIST) {
        if (image) {
          setSrc(image);
        }
        else {
          const path = await getArtistCover(id, true);
          if (path) {
            setSrc(path);
          }
          else {
            setSrc(transparent);
          }
        }
      }
      else if (type === CoverType.ALBUM) {
        if (image) {
          setSrc(image);
        }
        else {
          const path = await getAlbumCover(id, true);
          if (path) {
            setSrc(path);
          }
          else {
            setSrc(transparent);
          }
        }
      }
      revealImage();
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('folder')) {
        console.log('error getting cover image for edit cover:', message);
      }
      revealImage();
    }
  }

  useLayoutEffect(() => {

    getImage();

  }, [image, id]);

  useEffect(() => {
    albumBus.on(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, getImage);
    return () => {
      albumBus.off(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, getImage);
    }
  }, []);

  const editCoverSize = 140;

  const Local = StyleSheet.create({
    container: {
      backgroundColor: '#D2D2D2',
      width: editCoverSize, 
      height: editCoverSize,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: type === CoverType.ARTIST ? 1000 : 12,
      opacity: loaded ? 1 : 0
    },
    artwork: {
      width: editCoverSize, 
      height: editCoverSize,
      position: 'absolute',
      borderRadius: type === CoverType.ARTIST ? 1000 : 10,
    },
    tintOverlay: {
      width: type === CoverType.ARTIST ? editCoverSize+1 : editCoverSize,
      height: type === CoverType.ARTIST ? editCoverSize+1 : editCoverSize,
      position: 'absolute',
      backgroundColor: `rgba(0, 0, 0, ${src === transparent ? 0 : 0.6})`,
      borderRadius: type === CoverType.ARTIST ? 1000 : 10,
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
      <Animated.View style={[Local.container, {opacity: opacityRef}]}>
        <FastImage 
          source={src ? {uri: `${src}`} : {uri: transparent}}
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
            source={src === transparent ? require('@/src/assets/icons/edit-black.png') : require('@/src/assets/icons/edit.png')}
            style={Local.icon}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

}

export default EditCover;