import { StyleSheet, Animated } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import FastImage from 'react-native-fast-image';
import { getCoverImageData } from '@/lib/controllers/SongController';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAppIcon } from '@/constants/Logos';
import { PageType, CoverType } from '@/constants/Types';
import { useThemeContext } from '@/context/ThemeProvider';
import { getPlaylistCover } from '@/lib/controllers/PlaylistController';
import { PlaylistBusEvent, PlaylistImageModifiedEvent } from '@/station/playlist/Events';
import playlistBus from '@/station/playlist';
import { SongBusEvent, SongCoverModifiedEvent } from '@/station/song/Events';
import songBus from '@/station/song';
import { getArtistCover } from '@/lib/controllers/ArtistController';
import artistBus from '@/station/artist';
import { ArtistImageModifiedEvent } from '@/station/artist/Events';
import { ArtistBusEvent } from '@/station/artist/Events';
const ListCover = ({image, type, id, fade, propOnLoad}: {
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
      else if (type === CoverType.ARTIST) {
        const data = await getArtistCover(parseInt(id), true);
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

  const handlePlaylistModified = (data: PlaylistImageModifiedEvent) => {
    if (type === CoverType.PLAYLIST && id === data.id.toString()) {
      getImage();
    }
  }

  const handleSongModified = (data: SongCoverModifiedEvent) => {
    if (data.type === PageType.LIBRARY && Number(id) === data.id) {
      getImage();
    }
  }

  const handleArtistModified = (data: ArtistImageModifiedEvent) => {
    if (type === CoverType.ARTIST && id === data.id.toString()) {
      getImage();
    }
  }

  useEffect(() => {
    playlistBus.on(PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED, handlePlaylistModified);
    songBus.on(SongBusEvent.SONG_COVER_MODIFIED, handleSongModified);
    artistBus.on(ArtistBusEvent.ARTIST_IMAGE_MODIFIED, handleArtistModified);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED, handlePlaylistModified);
      songBus.off(SongBusEvent.SONG_COVER_MODIFIED, handleSongModified);
      artistBus.off(ArtistBusEvent.ARTIST_IMAGE_MODIFIED, handleArtistModified);
    }
  }, []);

  useEffect(() => {
    if (type === CoverType.SONG && id && editSong.id && editSong.id === id) {
      getImage();
    }
  }, [numModified])

  useEffect(() => {

    getImage();
    
  }, [image, id]);

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
    else if (type === CoverType.ARTIST) {
      return require('@/assets/icons/user.png');
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

export default ListCover;