import { useEffect, useState } from "react";
import ListCover from "@/src/components/cover/ListCover";
import Select from "@/src/components/Select";
import SongInfo from "@/src/components/song/SongInfo";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import {
  ArtistType,
  CoverType,
  PageType,
  SongType,
} from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import {
  getAlbumCover,
  getArtistsFromAlbum,
} from "@/src/controllers/AlbumController";
import { getArtistsFromSong } from "@/src/controllers/ArtistController";
import {
  getImportSongCover,
  getLibrarySongCover,
  isSongEdited,
} from "@/src/controllers/SongController";
import albumBus from "@/src/events/album";
import {
  AlbumBusEvent,
  AlbumToggledOnSongEvent,
} from "@/src/events/album/Events";
import artistBus from "@/src/events/artist";
import {
  ArtistBusEvent,
  ArtistToggledOnSongEvent,
} from "@/src/events/artist/Events";
import songBus from "@/src/events/song";
import {
  SongBusEvent,
  SongCoverModifiedEvent,
  SongInfoModifiedEvent,
} from "@/src/events/song/Events";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import * as Haptics from "expo-haptics";
import { Ellipsis } from "lucide-react-native";
import { PanResponder, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Handle from "../lists/Handle";

type SongProps = {
  song: SongType;
  fadeCover: boolean;
  fadeSong: boolean;
  active: boolean;
  previous?: boolean;
  handlePlay: (song: SongType) => Promise<void>;
  draggable?: boolean;
};

export default function Song({
  song,
  fadeCover,
  fadeSong,
  active,
  previous,
  handlePlay,
  draggable,
}: SongProps) {
  const [selected, setSelected] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [emptyCover, setEmptyCover] = useState(false);
  const [fileName, setFileName] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");

  const {
    selectEnabled,
    selectedSongs,
    results,
    haptic,

    setSelectedSongs,
    setEditSong,
  } = useGlobalContext();

  const { premium } = usePremiumContext();

  const opacity = useSharedValue(previous ? 0.3 : 1);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  useEffect(() => {
    opacity.value = withTiming(previous ? 0.3 : 1, {
      duration: 300,
      easing: Easing.ease,
    });
  }, [previous]);

  let blur = false;
  let message = false;
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

  // useEffect(() => {
  //   const checkSongEdited = async () => {
  //     const edited = await isSongEdited(song);
  //     console.log('song edited: ', song.title ?? song.fileName, edited);
  //   }
  //   checkSongEdited();
  // }, [song, title, artist, album]);

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
    };
  }, []);

  let disablePlay = false;
  if (
    song.pageType &&
    [PageType.IMPORT, PageType.QUEUE, PageType.REORDER].includes(song.pageType)
  ) {
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
          await loadCover();
        } else {
          setCoverImage("");
          setEmptyCover(true);
        }
      } else {
        loadCover();
        albumArtists = await getArtistsFromAlbum(data.albumId);
        songArtists = await getArtistsFromSong(song.id);
      }

      // add or remove artists from song
      if (data.add) {
        song.album = song.importAlbums[0].name;
        song.artist = [
          ...new Set(
            [...albumArtists, ...songArtists].map((artist) => artist.name),
          ),
        ].join(", ");
        setArtist(song.artist);
      } else {
        song.album = "";
        song.artist = songArtists
          .map((artist) => artist.name)
          .filter((artist) => !albumArtists.map((a) => a.name).includes(artist))
          .join(", ");
        setArtist(song.artist);
      }
    }
  };

  const updateArtistInfo = async (data: ArtistToggledOnSongEvent) => {
    if (data.songId === song.id) {
      let artists: ArtistType[] = [];
      if (song.pageType === PageType.IMPORT) {
        artists = song.importArtists ?? [];
      } else {
        artists = await getArtistsFromSong(song.id);
      }
      song.artist = artists.map((artist) => artist.name).join(", ");
      setArtist(song.artist);
    }
  };

  const updateSongInfo = async (data: SongInfoModifiedEvent) => {
    if (song.id === data.id) {
      song.title = data.title ?? song.title;
      song.artist = data.artist ?? song.artist;
      song.album = data.album ?? song.album;
      setTitle(song.title);
      setArtist(song.artist);
      setAlbum(song.album);
    }
  };

  const updateSongCover = async (data: SongCoverModifiedEvent) => {
    if (song.id === data.id) {
      if (data.cover) {
        song.artwork = data.cover;
        setCoverImage(data.cover);
      } else {
        await loadCover();
      }
    }
  };

  const loadCover = async () => {
    try {
      if (song.pageType === PageType.IMPORT) {
        const cover = await getImportSongCover(song);
        if (cover) {
          setCoverImage(cover);
          setEmptyCover(false);
        } else {
          setCoverImage("");
          setEmptyCover(true);
        }
      } else {
        const cover = await getLibrarySongCover(song.id, true);
        if (cover) {
          setCoverImage(cover);
          setEmptyCover(false);
        } else if (song.artwork) {
          setCoverImage(song.artwork);
          setEmptyCover(false);
        } else {
          setCoverImage("");
          setEmptyCover(true);
        }
      }
    } catch (error) {
      console.log("error loading song cover:", error);
    }
  };

  const handleMore = async () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditSong(song);
    if (song.pageType === PageType.IMPORT) {
      TrueSheet.present("import-song-sheet");
    } else {
      TrueSheet.present("song-sheet");
    }
  };

  // const panResponder = PanResponder.create({
  //   onMoveShouldSetPanResponder: () => true,
  //   onPanResponderMove: (e, gestureState) => {
  //     translateX.setValue(gestureState.dx);
  //   },
  // });

  return (
    <Animated.View
      // {...panResponder.panHandlers}
      style={[Local.container, opacityStyle]}
    >
      <TouchableOpacity
        style={[
          Local.contentContainer,
          {
            // backgroundColor: bg,
            opacity: !selectEnabled || (selectEnabled && selected) ? 1 : 0.6,
          },
        ]}
        activeOpacity={disablePlay ? 1 : 0.8}
        disabled={disablePlay}
        onPress={() => handlePlay(song)}
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
          isActive={active}
        />
        {selectEnabled && song.pageType !== PageType.QUEUE && !draggable && (
          <Select
            active={selected}
            handlePress={() => {
              setSelected(!selected);
              let newSongs = [];
              let i = 0;
              if (!selected && !selectedSongs.includes(song.id)) {
                if (selectedSongs.length == 0) {
                  newSongs[0] = song.id;
                } else {
                  for (i = 0; i < selectedSongs.length; i++) {
                    newSongs[i] = selectedSongs[i];
                  }
                  newSongs[i] = song.id;
                }
                setSelectedSongs(newSongs);
              } else if (selected) {
                for (i = 0; i < selectedSongs.length; i++) {
                  if (selectedSongs[i] != song.id) {
                    newSongs.push(selectedSongs[i]);
                  }
                }
                setSelectedSongs(newSongs);
              }
            }}
          />
        )}

        {!selectEnabled && song.pageType !== PageType.QUEUE && !draggable && (
          <Ellipsis
            onPress={handleMore}
            color={Colors.text}
            style={Local.more}
          />
        )}

        {draggable && <Handle />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const Local = StyleSheet.create({
  container: {
    width: "100%",
    height: 70,
  },
  contentContainer: {
    ...Styles.roundedContainer,
    ...Styles.listItem,
    marginBottom: 15,
  },
  skeleton: {
    ...Styles.roundedContainer,
    position: "absolute",
    width: "90%",
    height: 90,
    zIndex: 1,
  },
  blur: {
    ...Styles.roundedContainer,
    overflow: "hidden",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    left: 0,
    width: "90%",
    height: 60,
    zIndex: 2,
  },
  more: {
    paddingRight: 0,
    paddingVertical: 15,
    paddingLeft: 15,
  },
});
