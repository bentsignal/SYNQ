import { useEffect, useState } from "react";
import ListCover from "@/src/components/cover/ListCover";
import Select from "@/src/components/Select";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import {
  ArtistType,
  CoverType,
  PageType,
  SourceType,
} from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import {
  addArtistToAlbum,
  isArtistOnAlbum,
  removeArtistFromAlbum,
} from "@/src/controllers/AlbumController";
import {
  addArtistToSong,
  getArtistCover,
  isArtistOnSong,
  removeArtistFromSong,
} from "@/src/controllers/ArtistController";
import artistBus from "@/src/events/artist";
import {
  ArtistBusEvent,
  ArtistImageModifiedEvent,
} from "@/src/events/artist/Events";
import { useHaptics } from "@/src/hooks/use-haptics";
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
  const { editSong, setEditArtist, editAlbum } = useGlobalContext();
  const { sendHaptic } = useHaptics();

  const [selected, setSelected] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [emptyCover, setEmptyCover] = useState(false);

  const loadCover = async () => {
    try {
      const cover = await getArtistCover(artist.id);
      if (cover) {
        setCoverImage(cover);
        setEmptyCover(false);
      } else {
        setCoverImage("");
        setEmptyCover(true);
      }
    } catch (error) {
      console.log("error loading artist cover:", error);
    }
  };

  const selectionChanged = async (add: boolean) => {
    try {
      if (artist.sourceType === SourceType.ALBUM && editAlbum) {
        if (add) {
          await addArtistToAlbum(artist.id, editAlbum.id);
        } else {
          await removeArtistFromAlbum(artist.id, editAlbum.id);
        }
        artistBus.emit(ArtistBusEvent.ARTIST_TOGGLED_ON_ALBUM, {
          artistId: artist.id,
          albumId: editAlbum.id,
          add: add,
        });
      } else if (artist.sourceType === SourceType.SONG && editSong) {
        if (editSong.pageType === PageType.IMPORT) {
          editSong.importArtists = editSong.importArtists ?? [];
          editSong.importArtists = add
            ? [...editSong.importArtists, artist]
            : editSong.importArtists.filter((a) => a.id !== artist.id);
        } else if (add) {
          await addArtistToSong(artist.id, editSong.id);
        } else {
          await removeArtistFromSong(artist.id, editSong.id);
        }
        artistBus.emit(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, {
          artistId: artist.id,
          songId: editSong.id,
          add: add,
        });
      }
    } catch (error) {
      console.log("error saving artist list changes: ", error);
    }
  };

  const checkArtistOnSong = async () => {
    let result = false;
    if (editSong.pageType === PageType.IMPORT) {
      result = editSong.importArtists?.some((a) => a.id === artist.id);
    } else {
      result = await isArtistOnSong(artist.id, editSong.id);
    }
    setSelected(result);
  };

  const checkArtistOnAlbum = async () => {
    console.log(artist.id, editAlbum.id);
    const result = await isArtistOnAlbum(artist.id, editAlbum.id);
    console.log(artist.name, result);
    setSelected(result);
  };

  useEffect(() => {
    artistBus.on(
      ArtistBusEvent.ARTIST_IMAGE_MODIFIED,
      handleArtistImageModified,
    );
    return () => {
      artistBus.off(
        ArtistBusEvent.ARTIST_IMAGE_MODIFIED,
        handleArtistImageModified,
      );
    };
  }, []);

  useEffect(() => {
    if (editSong.id && artist.sourceType === SourceType.SONG) {
      checkArtistOnSong();
    } else if (editAlbum.id && artist.sourceType === SourceType.ALBUM) {
      checkArtistOnAlbum();
    }
  }, [editSong, editAlbum]);

  useEffect(() => {
    if (artist.image) {
      setCoverImage(artist.image);
    } else {
      loadCover();
    }
  }, [artist]);

  const handleArtistImageModified = async (data: ArtistImageModifiedEvent) => {
    if (data.id === artist.id) {
      if (data.image) {
        setCoverImage(data.image);
      } else {
        await loadCover();
      }
    }
  };

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
        ![PageType.LIBRARY, PageType.ALBUM].includes(artist.pageType)
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
        image={coverImage}
        type={CoverType.ARTIST}
        propOnLoad={() => {}}
        empty={emptyCover}
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
