import { useCallback, useEffect, useState } from "react";
import ListCover from "@/src/components/cover/ListCover";
import Select from "@/src/components/Select";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import {
  ArtistType,
  CoverType,
  PageType,
  SongType,
  SourceType,
} from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import {
  addArtistToLibraryAlbum,
  getLibraryArtistCoverPath,
  isArtistOnLibraryAlbum,
  removeArtistFromLibraryAlbum,
} from "@/src/features/library/repository/library-entity-repository";
import {
  addArtistToLibrarySong,
  isArtistOnLibrarySong,
  removeArtistFromLibrarySong,
} from "@/src/features/library/repository/library-song-repository";
import {
  addImportSongArtist,
  removeImportSongArtist,
  replaceImportSong,
} from "@/src/features/import/lib/import-song-edits";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import colors from "@/src/lib/colors";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ArtistProps = {
  artist: ArtistType;
  allowInteraction?: boolean;
  bg?: string;
};

const ArtistItem = ({ artist, allowInteraction, bg }: ArtistProps) => {
  const {
    editSong,
    setEditSong,
    setEditArtist,
    editAlbum,
    setEditAlbum,
  } = useActionSheetContext();
  const { setResults } = useImportFlowContext();
  const { sendHaptic } = useHaptics();

  const [selected, setSelected] = useState(false);
  const [fallbackCoverImage, setFallbackCoverImage] = useState("");

  const loadFallbackCover = useCallback(async () => {
    try {
      const cover = await getLibraryArtistCoverPath(artist.id);
      setFallbackCoverImage(cover ?? "");
    } catch (error) {
      console.log("error loading artist cover:", error);
    }
  }, [artist.id]);

  const selectionChanged = async (add: boolean) => {
    try {
      if (artist.sourceType === SourceType.ALBUM && editAlbum) {
        if (add) {
          await addArtistToLibraryAlbum(artist.id, editAlbum.id);
        } else {
          await removeArtistFromLibraryAlbum(artist.id, editAlbum.id);
        }
        setEditAlbum({ ...editAlbum });
      } else if (artist.sourceType === SourceType.SONG && editSong) {
        if (editSong.pageType === PageType.IMPORT) {
          if (add) {
            addImportSongArtist(editSong, artist);
          } else {
            removeImportSongArtist(editSong, artist.id);
          }
          setEditSong({ ...editSong });
          setResults((currentResults: SongType[]) =>
            replaceImportSong(currentResults, editSong),
          );
        } else {
          if (add) {
            await addArtistToLibrarySong(artist.id, editSong.id);
          } else {
            await removeArtistFromLibrarySong(artist.id, editSong.id);
          }
          setEditSong({ ...editSong });
        }
      }
    } catch (error) {
      console.log("error saving artist list changes: ", error);
    }
  };

  const checkArtistOnSong = useCallback(async () => {
    let result = false;
    if (editSong.pageType === PageType.IMPORT) {
      result =
        editSong.importArtists?.some(
          (importArtist: ArtistType) => importArtist.id === artist.id,
        ) ?? false;
    } else {
      result = await isArtistOnLibrarySong(artist.id, editSong.id);
    }
    setSelected(result);
  }, [artist.id, editSong]);

  const checkArtistOnAlbum = useCallback(async () => {
    const result = await isArtistOnLibraryAlbum(artist.id, editAlbum.id);
    setSelected(result);
  }, [artist.id, editAlbum]);

  useEffect(() => {
    if (editSong.id && artist.sourceType === SourceType.SONG) {
      checkArtistOnSong();
    } else if (editAlbum.id && artist.sourceType === SourceType.ALBUM) {
      checkArtistOnAlbum();
    }
  }, [
    artist.sourceType,
    checkArtistOnAlbum,
    checkArtistOnSong,
    editAlbum,
    editSong,
  ]);

  useEffect(() => {
    if (artist.image) {
      setFallbackCoverImage("");
    } else {
      loadFallbackCover();
    }
  }, [artist.id, artist.image, loadFallbackCover]);

  const handleMore = async () => {
    sendHaptic("light");
    setEditArtist(artist);
    TrueSheet.present("artist-sheet");
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
        !allowInteraction ||
        !(
          artist.pageType === PageType.LIBRARY ||
          artist.pageType === PageType.ALBUM
        )
      }
      onPress={async () => {
        if (artist.pageType === PageType.ADD) {
          await handleSelect();
        } else {
          router.push(`/library/artist/${artist.id}`);
        }
      }}
    >
      <ListCover
        image={artist.image ?? fallbackCoverImage}
        type={CoverType.ARTIST}
        propOnLoad={() => {}}
        empty={!artist.image && !fallbackCoverImage}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{artist.name}</Text>
      </View>
      {allowInteraction && artist.pageType === PageType.LIBRARY && (
        <TouchableOpacity className="py-2 pl-2" onPress={handleMore}>
          <Ellipsis color={colors.foreground} />
        </TouchableOpacity>
      )}
      {allowInteraction && artist.pageType === PageType.ADD && (
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
    ...Styles.h4,
    color: Colors.text,
  },
});

export default ArtistItem;
