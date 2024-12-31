import { View, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { PageType } from '@/constants/Types';
import { useThemeContext } from '@/context/ThemeProvider';
import { getPlaylistCover } from '@/lib/controllers/PlaylistController';
import { PlaylistBusEvent, PlaylistImageModifiedEvent } from '@/station/playlist/Events';
import playlistBus from '@/station/playlist';
import { getArtistCover } from '@/lib/controllers/ArtistController';

const SongListPageCover = ({id, type}: {id: string, type: PageType}) => {

  const [src, setSrc] = useState('');
  const [aspectRatio, setAspectRatio] = useState(1);
  const { theme } = useThemeContext();
  const coverPercent = 0.65;

  const getImage = async () => {
    try {
      if (type === PageType.PLAYLIST) {
        const data = await getPlaylistCover(parseInt(id), true);
        if (data) {
          setSrc(`data:image/jpeg;base64,${data}`);
        }
      }
      else if (type === PageType.ARTIST) {
        const data = await getArtistCover(parseInt(id), true);
        if (data) {
          setSrc(`data:image/jpeg;base64,${data}`);
        }
      }
    }
    catch (error) {
      console.log('error getting cover image for player: ', error);
    }
  }

  const handlePlaylistModified = (data: PlaylistImageModifiedEvent) => {
    if (type === PageType.PLAYLIST && id === data.id.toString()) {
      getImage();
    }
  }

  useEffect(() => {
    playlistBus.on(PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED, handlePlaylistModified); 
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED, handlePlaylistModified);
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
      aspectRatio: aspectRatio,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: type === PageType.ARTIST ? 1000 : 12,
    },
    artwork: {
      aspectRatio: aspectRatio,
      width: Dimensions.get('screen').width * coverPercent, 
      borderRadius: type === PageType.ARTIST ? 1000 : 12,
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
    else if (type === PageType.ARTIST) {
      return require('@/assets/icons/user.png');
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

export default SongListPageCover