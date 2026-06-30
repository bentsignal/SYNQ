import { useCallback, useEffect, useState } from "react";
import ListCover from "@/src/components/cover/ListCover";
import Select from "@/src/components/Select";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType, PageType, PlaylistType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import {
  addToPlaylist,
  getPlaylistCover,
  isSongInPlaylist,
  removeFromPlaylist,
} from "@/src/controllers/PlaylistController";
import { useHaptics } from "@/src/hooks/use-haptics";
import colors from "@/src/lib/colors";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PlaylistProps = {
  playlist: PlaylistType;
  bg?: string;
};

const PlaylistItem = ({ playlist, bg }: PlaylistProps) => {
  const { editSong, setEditPlaylist } = useGlobalContext();
  const { sendHaptic } = useHaptics();

  const [selected, setSelected] = useState(false);
  const [fallbackCoverImage, setFallbackCoverImage] = useState("");

  const loadFallbackCover = useCallback(async () => {
    try {
      const cover = await getPlaylistCover(playlist.id);
      setFallbackCoverImage(cover ?? "");
    } catch (error) {
      console.log("error loading playlist cover:", error);
    }
  }, [playlist.id]);

  const playlistChangesMade = async (add: boolean) => {
    try {
      if (add) {
        await addToPlaylist(playlist.id, editSong.id);
      } else {
        await removeFromPlaylist(playlist.id, editSong.id);
      }
    } catch (error) {
      console.log("error saving playlist changes: ", error);
    }
  };

  useEffect(() => {
    if (playlist.image) {
      setFallbackCoverImage("");
    } else {
      loadFallbackCover();
    }
  }, [loadFallbackCover, playlist.id, playlist.image]);

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
        image={playlist.image ?? fallbackCoverImage}
        type={CoverType.PLAYLIST}
        empty={!playlist.image && !fallbackCoverImage}
        propOnLoad={() => {}}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{playlist.name}</Text>
        <Text style={Local.count}>
          {playlist.songCount} {playlist.songCount === 1 ? "song" : "songs"}
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
