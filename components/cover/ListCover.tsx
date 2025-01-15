import { StyleSheet, Animated, Image } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import FastImage from 'react-native-fast-image';
import { getSongCover } from '@/lib/controllers/ImageController';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAppIcon } from '@/constants/Logos';
import { PageType, CoverType } from '@/constants/Types';
import { useThemeContext } from '@/context/ThemeProvider';
import { getPlaylistCover } from '@/lib/controllers/PlaylistController';
import { PlaylistBusEvent, PlaylistImageModifiedEvent } from '@/src/events/playlist/Events';
import playlistBus from '@/src/events/playlist';
import { SongBusEvent, SongCoverModifiedEvent } from '@/src/events/song/Events';
import songBus from '@/src/events/song';
import { getArtistCover } from '@/lib/controllers/ArtistController';
import artistBus from '@/src/events/artist';
import { ArtistImageModifiedEvent } from '@/src/events/artist/Events';
import { ArtistBusEvent } from '@/src/events/artist/Events';
import { getAlbumCover, getAlbumCoverFromSong } from '@/lib/controllers/AlbumController';
import { AlbumBusEvent, AlbumImageModifiedEvent } from '@/src/events/album/Events';
import albumBus from '@/src/events/album';

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
          const path = await getSongCover(id);
          if (path) {
            setSrc(path);
          }
          else {
            const path = await getAlbumCoverFromSong(parseInt(id));
            if (path) {
              setSrc(path);
            }
          }
        }
      }
      else if (type === CoverType.PLAYLIST) {
        const path = await getPlaylistCover(parseInt(id), true);
        if (path) {
          setSrc(path);
        }
      }
      else if (type === CoverType.ARTIST) {
        const path = await getArtistCover(parseInt(id), true);
        if (path) {
          setSrc(path);
        }
      }
      else if (type === CoverType.ALBUM) {
        const path = await getAlbumCover(parseInt(id), true);
        if (path) {
          setSrc(path);
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

  const handlePlaylistModified = async (data: PlaylistImageModifiedEvent) => {
    if (type === CoverType.PLAYLIST && id === data.id.toString()) {
      await getImage();
    }
  }

  const handleSongModified = async (data: SongCoverModifiedEvent) => {
    if (data.type === PageType.LIBRARY && Number(id) === data.id) {
      await getImage();
    }
  }

  const handleArtistModified = async (data: ArtistImageModifiedEvent) => {
    if (type === CoverType.ARTIST && id === data.id.toString()) {
      await getImage();
    }
  }

  const handleAlbumModified = async (data: AlbumImageModifiedEvent) => {
    if (type === CoverType.ALBUM && id === data.id.toString()) {
      await getImage();
    }
    else if (type === CoverType.SONG) {
      await getImage();
    }
  }

  useEffect(() => {
    playlistBus.on(PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED, handlePlaylistModified);
    songBus.on(SongBusEvent.SONG_COVER_MODIFIED, handleSongModified);
    artistBus.on(ArtistBusEvent.ARTIST_IMAGE_MODIFIED, handleArtistModified);
    albumBus.on(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, handleAlbumModified);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED, handlePlaylistModified);
      songBus.off(SongBusEvent.SONG_COVER_MODIFIED, handleSongModified);
      artistBus.off(ArtistBusEvent.ARTIST_IMAGE_MODIFIED, handleArtistModified);
      albumBus.off(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, handleAlbumModified);
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
      return {uri: `${src}`};
    }
    else if (type === CoverType.PLAYLIST) {
      if (id === '2') {
        return require('@/assets/icons/heart.png');
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