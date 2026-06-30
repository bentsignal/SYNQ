import { View, StyleSheet, Dimensions } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { PageType } from '@/src/constants/Types';
import { getPlaylistCover } from '@/src/controllers/PlaylistController';
import { getArtistCover } from '@/src/controllers/ArtistController';
import { getAlbumCover } from '@/src/controllers/AlbumController';

type SongListPageCoverProps = {
  id: number;
  type: PageType;
  image?: string;
};

const SongListPageCover = ({id, type, image}: SongListPageCoverProps) => {

  const [fallbackSrc, setFallbackSrc] = useState('');
  const coverPercent = 0.65;
  const src = image ?? fallbackSrc;

  const loadFallbackImage = useCallback(async () => {
    if (image) {
      setFallbackSrc('');
      return;
    }

    try {
      if (type === PageType.PLAYLIST) {
        const path = await getPlaylistCover(id, true);
        if (path) {
          setFallbackSrc(path);
        }
        else {
          setFallbackSrc('');
        }
      }
      else if (type === PageType.ARTIST) {
        const path = await getArtistCover(id, true);
        if (path) {
          setFallbackSrc(path);
        }
        else {
          setFallbackSrc('');
        }
      }
      else if (type === PageType.ALBUM) {
        const path = await getAlbumCover(id, true);
        if (path) {
          setFallbackSrc(path);
        }
        else {
          setFallbackSrc('');
        }
      }
    }
    catch (error) {
      console.log('error getting cover image for player: ', error);
    }
  }, [id, image, type]);

  useEffect(() => {
    loadFallbackImage();
  }, [loadFallbackImage]);

  const Local = StyleSheet.create({
    container: {
      backgroundColor: src ? 'transparent' : '#D2D2D2',
      width: Dimensions.get('screen').width * coverPercent, 
      minHeight: Dimensions.get('screen').width * coverPercent,
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: type === PageType.ARTIST ? 1000 : 12,
    },
    artwork: {
      aspectRatio: 1,
      width: src ? Dimensions.get('screen').width * coverPercent : 60, 
      borderRadius: type === PageType.ARTIST ? 1000 : 12,
    },
  });

  const getSource = () => {
    if (src) {
      return {uri: `${src}`};
    }
    else if (type === PageType.PLAYLIST && id === 2) {
      return require('@/src/assets/icons/heart.png');
    }
    else if (type === PageType.PLAYLIST) {
      return require('@/src/assets/icons/cassette-tape.png');
    }
    else if (type === PageType.ALBUM) {
      return require('@/src/assets/icons/cd-drive.png');
    }
    else if (type === PageType.ARTIST) {
      return require('@/src/assets/icons/user.png');
    }
    else {
      return require('@/src/assets/icons/music.png');
    }
  }

  return (
    <View style={Local.container}>
      <FastImage
        source={getSource()}
        style={Local.artwork}
      />
    </View>
  );

}

export default SongListPageCover;
