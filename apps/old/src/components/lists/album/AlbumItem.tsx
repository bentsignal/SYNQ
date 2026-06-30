import { useCallback, useEffect, useState } from "react";
import ListCover from "@/src/components/cover/ListCover";
import Select from "@/src/components/Select";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { AlbumType, CoverType, PageType, SongType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import {
  addAlbumToSong,
  getAlbumCover,
  getArtistsFromAlbum,
  isAlbumOnSong,
  removeAlbumFromSong,
} from "@/src/controllers/AlbumController";
import {
  addArtistToSong,
  removeArtistFromSong,
} from "@/src/controllers/ArtistController";
import {
  addImportSongAlbum,
  removeImportSongAlbum,
  replaceImportSong,
} from "@/src/features/import/lib/import-song-edits";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useHaptics } from "@/src/hooks/use-haptics";
import colors from "@/src/lib/colors";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AlbumProps = {
  album: AlbumType;
  allowInteraction?: boolean;
  bg?: string;
};

const AlbumItem = ({ album, allowInteraction, bg }: AlbumProps) => {
  const { editSong, setEditSong, setEditAlbum } = useGlobalContext();
  const { setResults } = useImportFlowContext();
  const { sendHaptic } = useHaptics();

  const [selected, setSelected] = useState(false);
  const [fallbackCoverImage, setFallbackCoverImage] = useState("");

  const loadFallbackCover = useCallback(async () => {
    try {
      const cover = await getAlbumCover(album.id);
      setFallbackCoverImage(cover ?? "");
    } catch (error) {
      console.log("error loading album cover:", error);
    }
  }, [album.id]);

  useEffect(() => {
    if (album.image) {
      setFallbackCoverImage("");
    } else {
      loadFallbackCover();
    }
  }, [album.id, album.image, loadFallbackCover]);

  const selectionChanged = async (add: boolean) => {
    try {
      if (editSong.pageType === PageType.IMPORT) {
        const artists = await getArtistsFromAlbum(album.id);
        if (add) {
          addImportSongAlbum(editSong, album, artists);
        } else {
          removeImportSongAlbum(editSong, album.id, artists);
        }
        setEditSong({ ...editSong });
        setResults((currentResults: SongType[]) =>
          replaceImportSong(currentResults, editSong),
        );
      } else {
        if (add) {
          await addAlbumToSong(album.id, editSong.id);
          const artists = await getArtistsFromAlbum(album.id);
          await Promise.all(
            artists.map((artist) => addArtistToSong(artist.id, editSong.id)),
          );
        } else {
          await removeAlbumFromSong(album.id, editSong.id);
          const artists = await getArtistsFromAlbum(album.id);
          await Promise.all(
            artists.map((artist) => removeArtistFromSong(artist.id, editSong.id)),
          );
        }
        setEditSong({ ...editSong });
      }
    } catch (error) {
      console.log("error saving album list changes: ", error);
    }
  };

  const checkAlbumOnSong = useCallback(async () => {
    let result = false;
    if (editSong.pageType === PageType.IMPORT) {
      result =
        editSong.importAlbums?.some(
          (importAlbum: AlbumType) => importAlbum.id === album.id,
        ) ?? false;
    } else {
      result = await isAlbumOnSong(album.id, editSong.id);
    }
    setSelected(result);
  }, [album.id, editSong]);

  useEffect(() => {
    if (editSong.id && album.pageType === PageType.ADD) {
      checkAlbumOnSong();
    }
  }, [album.pageType, checkAlbumOnSong, editSong]);

  const handleMore = async () => {
    sendHaptic("light");
    setEditAlbum(album);
    TrueSheet.present("album-sheet");
  };

  const handleSelect = async () => {
    setSelected(!selected);
    await selectionChanged(!selected);
  };

  return (
    <TouchableOpacity
      style={[Local.container, { backgroundColor: bg ?? Colors.song }]}
      activeOpacity={0.8}
      disabled={
        !allowInteraction || album.pageType !== PageType.LIBRARY
      }
      onPress={async () => {
        if (album.pageType === PageType.ADD) {
          await handleSelect();
        } else {
          router.push(`/library/album/${album.id}`);
        }
      }}
    >
      <ListCover
        image={album.image ?? fallbackCoverImage}
        type={CoverType.ALBUM}
        propOnLoad={() => {}}
        empty={!album.image && !fallbackCoverImage}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name} numberOfLines={1}>
          {album.name}
        </Text>
        <Text style={Local.year} numberOfLines={1}>
          {album.year ?? "Unknown Year"}
        </Text>
      </View>
      {allowInteraction && album.pageType === PageType.LIBRARY && (
        <TouchableOpacity className="py-2 pl-2" onPress={handleMore}>
          <Ellipsis color={colors.foreground} />
        </TouchableOpacity>
      )}
      {allowInteraction && album.pageType === PageType.ADD && (
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
    width: "90%",
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
  year: {
    ...Styles.sub,
    color: Colors.infoText,
    fontWeight: "500",
  },
});

export default AlbumItem;
