import { TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { Styles } from '@/src/constants/Styles';
import { Colors } from '@/src/constants/Colors';
import { SongType } from '@/src/constants/Types';
import SongInfo from '@/src/components/song/SongInfo';
import Select from '@/src/components/Select';
import ListCover from '@/src/components/cover/ListCover';
import * as Haptics from 'expo-haptics';
import More from '@/src/components/More';
import { PageType, CoverType, ArtistType } from '@/src/constants/Types';
import { useActiveTrack } from "react-native-track-player";
import { getTrackFromSong, playTrack, 
  updateQueue, playAd, addToQueue } from '@/src/controllers/PlayerController';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { usePremiumContext } from '@/src/context/PremiumProvider';
import songBus from '@/src/events/song';
import { SongBusEvent, SongInfoModifiedEvent, 
  SongCoverModifiedEvent } from '@/src/events/song/Events';
import { usePlaybackContext } from '@/src/context/PlaybackProvider';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ArtistToggledOnSongEvent, ArtistBusEvent } from '@/src/events/artist/Events';
import { getArtistsFromSong } from '@/src/controllers/ArtistController';
import artistBus from '@/src/events/artist';
import albumBus from '@/src/events/album';
import { AlbumBusEvent, AlbumToggledOnSongEvent } from '@/src/events/album/Events';
import { getAlbumCover, getArtistsFromAlbum } from '@/src/controllers/AlbumController';
import { getAbsoluteSongCover } from '@/src/controllers/SongController';

type SongProps = {
  song: SongType, 
  fadeCover: boolean, 
  fadeSong: boolean,
  activeId?: number,
}

export default function Song({ song, fadeCover, fadeSong, activeId }: SongProps) {

  const [selected, setSelected] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const [coverImage, setCoverImage] = useState('');
  const [emptyCover, setEmptyCover] = useState(false);
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');

  const track = useActiveTrack();

  const { 

    selectEnabled, selectedSongs, results,
    haptic, adPlaying, adURL, shouldPlayAd,

    setSelectedSongs, 
    setEditSong, setAdPlaying,

  } = useGlobalContext(); 

  const { shuffle, setSourceType, setSourceId } = usePlaybackContext();
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();

  let blur = false;
  let message = false
  if (results && results[0] && results[1] && results[0].id && results[1].id) {
    if (!premium) {
      if (results[0].id != song.id) {
        blur = true;
      }
      if (results[1].id == song.id) {
        message = true;
      }
    }
  }

  let bg = Colors.song;
  // if (track !== null && song.id == track.id) {
  //   bg = theme;
  // }
  if (blur) {
    bg = Colors.background;
  }

  useEffect(() => {
    setSelected(false);
    if (!selectEnabled) {
      setSelectedSongs([]);
    }
  }, [selectEnabled]);

  useEffect(() => {
    loadCover();
    setFileName(song.fileName);
    setTitle(song.title);
    setArtist(song.artist);
    setAlbum(song.album);
  }, [song]);

  useEffect(() => {
    songBus.on(SongBusEvent.SONG_INFO_MODIFIED, updateSongInfo);
    songBus.on(SongBusEvent.SONG_COVER_MODIFIED, updateSongCover);
    artistBus.on(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, updateArtistInfo);
    albumBus.on(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, updateAlbumInfo);
    albumBus.on(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, loadCover);
    return () => {
      songBus.off(SongBusEvent.SONG_INFO_MODIFIED, updateSongInfo);
      songBus.off(SongBusEvent.SONG_COVER_MODIFIED, updateSongCover);
      artistBus.off(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, updateArtistInfo);
      albumBus.off(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, updateAlbumInfo);
      albumBus.off(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, loadCover);
    }
  }, []);

  let disablePlay = false;
  if (song.pageType && [PageType.IMPORT, PageType.QUEUE].includes(song.pageType)) { 
    disablePlay = true;
  }

  const updateAlbumInfo = async (data: AlbumToggledOnSongEvent) => {
    if (data.songId === song.id) {
      
      let songArtists: ArtistType[] = [];
      let albumArtists: ArtistType[] = [];

      if (song.pageType === PageType.IMPORT) {
        songArtists = song.importArtists ?? [];
        albumArtists = await getArtistsFromAlbum(data.albumId);
        if (data.add) {
          const cover = await getAlbumCover(data.albumId);
          if (cover) {
            setCoverImage(cover);
            setEmptyCover(false);
          }
        }
        else {
          setCoverImage('');
          setEmptyCover(true);
        }
      }
      else {
        loadCover();
        albumArtists = await getArtistsFromAlbum(data.albumId);
        songArtists = await getArtistsFromSong(song.id);
      }

      // add or remove artists from song
      if (data.add) {
        song.artist = [...new Set([...albumArtists, ...songArtists].map(artist => artist.name))].join(', ');
        setArtist(song.artist);
      }
      else {
        song.artist = songArtists.map(artist => artist.name).filter(artist => !albumArtists.map(a => a.name).includes(artist)).join(', ');
        setArtist(song.artist);
      }

    }
  }

  const updateArtistInfo = async (data: ArtistToggledOnSongEvent) => {
    if (data.songId === song.id) {
      let artists: ArtistType[] = [];
      if (song.pageType === PageType.IMPORT) {
        artists = song.importArtists ?? [];
      }
      else {
        artists = await getArtistsFromSong(song.id);
      }
      song.artist = artists.map(artist => artist.name).join(', ');
      setArtist(song.artist);
    }
  }

  const updateSongInfo = async (data: SongInfoModifiedEvent) => {
    if (song.id === data.id) {
      song.title = data.title ?? song.title;
      song.artist = data.artist ?? song.artist;
      song.album = data.album ?? song.album;
      setTitle(song.title);
      setArtist(song.artist);
      setAlbum(song.album);
    }
  }

  const updateSongCover = async (data: SongCoverModifiedEvent) => {
    if (song.id === data.id) {
      if (data.cover) {
        song.artwork = data.cover;
        setCoverImage(data.cover);
      }
      else {
        await loadCover();
      } 
    }
  }

  const loadCover = async () => {
    try {
      const cover = await getAbsoluteSongCover(song.id, true);
      if (cover) {
        setCoverImage(cover);
        setEmptyCover(false);
      }
      else if (song.importAlbums && song.importAlbums.length > 0) {
        const album = song.importAlbums[0];
        const cover = await getAlbumCover(album.id);
        if (cover) {
          setCoverImage(cover);
          setEmptyCover(false);
        }
      }
      else if (song.artwork) {
        setCoverImage(song.artwork);
        setEmptyCover(false);
      }
      else {
        setCoverImage('');
        setEmptyCover(true);
      }
    }
    catch (error) {
      console.log('error loading song cover:', error);
    }
  }

  const handlePlay = async () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const id = track?.id ? track.id : -1;
    // play ad if user is non premium and has passed ad threshold
    if (!premium && shouldPlayAd && !adPlaying) {
      setAdPlaying(true);
      await playAd(theme, adURL);
      const newTrack = await getTrackFromSong(song, theme);
      await updateQueue(song.id, shuffle, theme, song.sourceType, song.sourceId);
      setSourceType(song.sourceType);
      setSourceId(song.sourceId);
      if (newTrack) {
        await addToQueue(newTrack);
      }
    }
    // if ad is not played, play song
    else if (id !== song.id && !adPlaying) {
      setAdPlaying(false);
      try {
        const newTrack = await getTrackFromSong(song, theme);
        if (newTrack) {
          await playTrack(newTrack);
          await updateQueue(song.id, shuffle, theme, song.sourceType, song.sourceId);
          setSourceType(song.sourceType);
          setSourceId(song.sourceId);
        }
      }
      catch (error) {
        console.log('error playing song: ', error);
      }
    }
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      translateX.setValue(gestureState.dx);
    },
  });

  return (
    <Animated.View 
      // {...panResponder.panHandlers}
      style={[Local.container, {
        transform: [{ translateX }]
      }]}>
      <TouchableOpacity 
        style={[Local.contentContainer, {
          // backgroundColor: bg,
          opacity: !selectEnabled || (selectEnabled && selected) ? 1 : 0.6,
        }]}
        activeOpacity={disablePlay ? 1 : 0.8}
        disabled={disablePlay}
        onPress={handlePlay}
      >
        <ListCover 
          image={coverImage}
          type={CoverType.SONG}
          fade={fadeCover}
          empty={emptyCover}
          propOnLoad={() => {}}
          size={55}
        />
        <SongInfo 
          fileName={fileName}
          title={title}
          artist={artist}
          album={album}
          id={song.id}
          isActive={song.pageType !== PageType.QUEUE && activeId === song.id}
        />
        {

          selectEnabled &&
          
          <Select 
            active={selected} 
            handlePress={() => {
              setSelected(!selected);
              let newSongs = [];
              let i = 0;
              if (!selected && !selectedSongs.includes(song.id)) {
                if (selectedSongs.length == 0) {
                  newSongs[0] = song.id;
                }
                else {
                  for (i = 0; i < selectedSongs.length; i++) {
                    newSongs[i] = selectedSongs[i];
                  }
                  newSongs[i] = song.id;
                }
                setSelectedSongs(newSongs);
              }
              else if (selected) {
                for (i = 0; i < selectedSongs.length; i++) {
                  if (selectedSongs[i] != song.id) {
                    newSongs.push(selectedSongs[i]);
                  }
                }
                setSelectedSongs(newSongs);
              }
            }}
          />

        }

        {

          !selectEnabled && song.pageType !== PageType.QUEUE &&

          <More 
            handlePress={() => {
              if (haptic) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setEditSong(song);
              TrueSheet.present('song-sheet');
            }}
          />

        }
      </TouchableOpacity>
    </Animated.View>
  );

}

const Local = StyleSheet.create({
  container: {
    width: '100%',
  },
  contentContainer: {
    ...Styles.roundedContainer,
    ...Styles.listItem,
    marginBottom: 15,
  },
  skeleton: {
    ...Styles.roundedContainer,
    position: 'absolute',
    width: '90%',
    height: 90,
    zIndex: 1,
  },
  blur: {
    ...Styles.roundedContainer,
    overflow: 'hidden',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    width: '90%',
    height: 60,
    zIndex: 2
  },
  
});