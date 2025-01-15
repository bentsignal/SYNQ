import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { useEffect, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { PageType } from '@/constants/Types';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { getPlaylistCover } from '@/lib/controllers/PlaylistController';
import { PlaylistBusEvent, PlaylistImageModifiedEvent } from '@/src/events/playlist/Events';
import playlistBus from '@/src/events/playlist';
import { getArtistCover } from '@/lib/controllers/ArtistController';
import { ArtistBusEvent, ArtistImageModifiedEvent } from '@/src/events/artist/Events';
import artistBus from '@/src/events/artist';
import { getAlbumCover } from '@/lib/controllers/AlbumController';
import { AlbumBusEvent, AlbumImageModifiedEvent } from '@/src/events/album/Events';
import albumBus from '@/src/events/album';

const SongListPageCover = ({id, type}: {id: string, type: PageType}) => {

  const [src, setSrc] = useState('');
  const { theme } = useThemeContext();
  const coverPercent = 0.65;

  const getImage = async () => {
    try {
      if (type === PageType.PLAYLIST) {
        const path = await getPlaylistCover(parseInt(id), true);
        if (path) {
          setSrc(path);
        }
      }
      else if (type === PageType.ARTIST) {
        const path = await getArtistCover(parseInt(id), true);
        if (path) {
          setSrc(path);
        }
      }
      else if (type === PageType.ALBUM) {
        const path = await getAlbumCover(parseInt(id), true);
        if (path) {
          setSrc(path);
        }
      }
    }
    catch (error) {
      console.log('error getting cover image for player: ', error);
    }
  }

  const handlePlaylistModified = async (data: PlaylistImageModifiedEvent) => {
    if (type === PageType.PLAYLIST && id === data.id.toString()) {
      await getImage();
    }
  }

  const handleArtistModified = async (data: ArtistImageModifiedEvent) => {
    if (type === PageType.ARTIST && id === data.id.toString()) {
      await getImage();
    }
  }

  const handleAlbumModified = async (data: AlbumImageModifiedEvent) => {
    if (type === PageType.ALBUM && id === data.id.toString()) {
      await getImage();
    }
  }

  useEffect(() => {
    playlistBus.on(PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED, handlePlaylistModified); 
    artistBus.on(ArtistBusEvent.ARTIST_IMAGE_MODIFIED, handleArtistModified);
    albumBus.on(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, handleAlbumModified);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED, handlePlaylistModified);
      artistBus.off(ArtistBusEvent.ARTIST_IMAGE_MODIFIED, handleArtistModified);
      albumBus.off(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, handleAlbumModified);
    }
  }, []);

  useEffect(() => {
    
    getImage();

  }, [id]);

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
    else if (type === PageType.PLAYLIST && id === '2') {
      return require('@/assets/icons/heart.png');
    }
    else if (type === PageType.PLAYLIST) {
      return require('@/assets/icons/cassette-tape.png');
    }
    else if (type === PageType.ALBUM) {
      return require('@/assets/icons/cd-drive.png');
    }
    else if (type === PageType.ARTIST) {
      return require('@/assets/icons/user.png');
    }
    else {
      return require('@/assets/icons/music.png');
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