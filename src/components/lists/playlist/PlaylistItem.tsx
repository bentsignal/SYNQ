import { useEffect, useRef, useState } from "react";
import ListCover from "@/src/components/cover/ListCover";
import Select from "@/src/components/Select";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType, PageType, PlaylistType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import {
  addToPlaylist,
  getPlaylistCover,
  getSongCount,
  isSongInPlaylist,
  removeFromPlaylist,
} from "@/src/controllers/PlaylistController";
import playlistBus from "@/src/events/playlist";
import {
  PlaylistBusEvent,
  PlaylistImageModifiedEvent,
  PlaylistNameModifiedEvent,
  PlaylistSongCountModifiedEvent,
} from "@/src/events/playlist/Events";
import { useHaptics } from "@/src/hooks/use-haptics";
import colors from "@/src/lib/colors";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import {
  DeviceEventEmitter,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PlaylistProps = {
  playlist: PlaylistType;
  bg?: string;
};

const PlaylistItem = ({ playlist, bg }: PlaylistProps) => {
  const { editSong, setEditPlaylist, numModified } = useGlobalContext();
  const { sendHaptic } = useHaptics();

  const [selected, setSelected] = useState(false);
  const [songCount, setSongCount] = useState(playlist.songCount);
  const [name, setName] = useState(playlist.name);
  const [coverImage, setCoverImage] = useState("");
  const [emptyCover, setEmptyCover] = useState(false);

  const loadCover = async () => {
    try {
      const cover = await getPlaylistCover(playlist.id);
      if (cover) {
        setCoverImage(cover);
        setEmptyCover(false);
      } else {
        setCoverImage("");
        setEmptyCover(true);
      }
    } catch (error) {
      console.log("error loading playlist cover:", error);
    }
  };

  const playlistChangesMade = async (add: boolean) => {
    try {
      if (add) {
        await addToPlaylist(playlist.id, editSong.id);
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED, {
          id: playlist.id,
          songCount: songCount + 1,
        });
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED);
      } else {
        await removeFromPlaylist(playlist.id, editSong.id);
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED, {
          id: playlist.id,
          songCount: songCount - 1,
        });
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED);
      }
    } catch (error) {
      console.log("error saving playlist changes: ", error);
    }
  };

  const updateSongCount = async (data: PlaylistSongCountModifiedEvent) => {
    if (playlist.id === data.id) {
      if (data.songCount === -1) {
        const count = await getSongCount(playlist.id);
        setSongCount(count);
        playlist.songCount = count;
      } else {
        setSongCount(data.songCount);
        playlist.songCount = data.songCount;
      }
    }
  };

  const updateName = (data: PlaylistNameModifiedEvent) => {
    if (playlist.id === data.id) {
      setName(data.name);
      playlist.name = data.name;
    }
  };

  useEffect(() => {
    playlistBus.on(
      PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED,
      updateSongCount,
    );
    playlistBus.on(PlaylistBusEvent.PLAYLIST_NAME_MODIFIED, updateName);
    playlistBus.on(
      PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED,
      handlePlaylistImageModified,
    );
    return () => {
      playlistBus.off(
        PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED,
        updateSongCount,
      );
      playlistBus.off(PlaylistBusEvent.PLAYLIST_NAME_MODIFIED, updateName);
      playlistBus.off(
        PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED,
        handlePlaylistImageModified,
      );
    };
  }, []);

  useEffect(() => {
    loadCover();
  }, [playlist]);

  useEffect(() => {
    if (editSong.id && playlist.pageType === PageType.ADD) {
      isSongInPlaylist(playlist.id, editSong.id)
        .then((result) => {
          setSelected(result);
        })
        .catch((error) => {
          console.log("error checking if song is in playlist:", error);
        });
    }
  }, [editSong]);

  const handlePlaylistImageModified = async (
    data: PlaylistImageModifiedEvent,
  ) => {
    if (data.id === playlist.id) {
      if (data.image) {
        setCoverImage(data.image);
      } else {
        await loadCover();
      }
    }
  };

  const handleMore = async () => {
    sendHaptic("light");
    setEditPlaylist(playlist);
    TrueSheet.present("playlist-sheet");
  };

  const handleSelect = async () => {
    setSelected(!selected);
    await playlistChangesMade(!selected);
  };

  return (
    <TouchableOpacity
      style={[Local.container, { backgroundColor: bg ?? Colors.song }]}
      activeOpacity={0.8}
      onPress={async () => {
        if (playlist.pageType === PageType.ADD) {
          await handleSelect();
        } else {
          router.push(`/library/playlist/${playlist.id}`);
        }
      }}
    >
      <ListCover
        id={playlist.id}
        image={coverImage}
        type={CoverType.PLAYLIST}
        empty={emptyCover}
        propOnLoad={() => {}}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{name}</Text>
        <Text style={Local.count}>
          {songCount} {songCount === 1 ? "song" : "songs"}
        </Text>
      </View>
      {playlist.pageType === PageType.LIBRARY && (
        <TouchableOpacity className="py-2 pl-2" onPress={handleMore}>
          <Ellipsis color={colors.foreground} />
        </TouchableOpacity>
      )}
      {playlist.pageType === PageType.ADD && (
        <Select active={selected} handlePress={handleSelect} />
      )}
    </TouchableOpacity>
  );
};

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    ...Styles.listItem,
    ...Styles.nonSongItem,
  },
  textWrapper: {
    paddingLeft: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  name: {
    ...Styles.h5,
    color: Colors.text,
  },
  count: {
    ...Styles.p,
    color: Colors.infoText,
    fontWeight: "500",
  },
});

export default PlaylistItem;
