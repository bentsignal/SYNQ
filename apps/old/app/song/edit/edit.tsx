import { Fragment, memo, useCallback, useEffect, useState } from "react";
import EditCover from "@/src/features/cover/components/EditCover";
import CustomButton from "@/src/shared/components/CustomButton";
import AlbumItem from "@/src/features/library/components/lists/album/AlbumItem";
import ArtistItem from "@/src/features/library/components/lists/artist/ArtistItem";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import Notifications from "@/src/features/notifications/components/Notifications";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import {
  AlbumType,
  ArtistType,
  CoverType,
  PageType,
} from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { pickCoverImage } from "@/src/features/images/repository/image-repository";
import {
  getLibrarySongAlbums,
  getLibrarySongArtists,
  getLibrarySongCoverPath,
} from "@/src/features/library/repository/library-song-repository";
import { updateLibrarySongs } from "@/src/features/library/repository/song-metadata-repository";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import {
  getImportSongCover,
  saveImportSongEdits,
} from "@/src/features/import/lib/import-song-edits";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { getDurationString } from "@/src/lib/util";
import { router, useFocusEffect } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoTextInput = memo(TextInput);

const EditSong = ({ id }: { id: number }) => {
  const insets = useSafeAreaInsets();

  const {
    editSong,
    setNumModified,
    numModified,
  } = useActionSheetContext();
  const { results, setResults } = useImportFlowContext();
  const { selectedSongs, setSelectedSongs, setSelectEnabled } =
    useSelectionContext();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [image, setImage] = useState("");
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const [albums, setAlbums] = useState<AlbumType[]>([]);

  const loadArtists = useCallback(async () => {
    if (editSong.pageType === PageType.IMPORT) {
      setArtists(editSong.importArtists ?? []);
    } else {
      const artists = await getLibrarySongArtists(id);
      setArtists(artists);
    }
  }, [editSong, id]);

  const loadAlbums = useCallback(async () => {
    if (editSong.pageType === PageType.IMPORT) {
      setAlbums(editSong.importAlbums ?? []);
    } else {
      const albums = await getLibrarySongAlbums(id);
      setAlbums(albums);
    }
  }, [editSong, id]);

  const loadCover = useCallback(async () => {
    if (editSong.pageType === PageType.IMPORT) {
      const cover = await getImportSongCover(editSong);
      setImage(cover ?? "");
    } else {
      const cover = await getLibrarySongCoverPath(id, true);
      setImage(cover ?? "");
    }
  }, [editSong, id]);

  const refreshRelations = useCallback(() => {
    if (editSong) {
      loadArtists();
      loadAlbums();
      loadCover();
    }
  }, [editSong, loadAlbums, loadArtists, loadCover]);

  useEffect(() => {
    if (editSong) {
      setTitle(editSong.title ?? "");
      setArtist(editSong.artist ?? "");
      setAlbum(editSong.album ?? "");
      refreshRelations();
    }
  }, [editSong, refreshRelations]);

  useFocusEffect(
    useCallback(() => {
      refreshRelations();
    }, [refreshRelations]),
  );

  const handleUpdateImage = async () => {
    const cover = await pickCoverImage();
    if (cover) {
      setImage(cover);
      await handleSave({ newTitle: title, newImage: cover });
    }
  };

  const handleTitleUpdate = async (text: string) => {
    setTitle(text);
    await handleSave({ newTitle: text, newImage: image });
  };

  const handleSave = async ({
    newTitle,
    newImage,
  }: {
    newTitle: string;
    newImage: string;
  }) => {
    try {
      const editPageType = editSong.pageType;
      if (
        editPageType &&
        [PageType.LIBRARY, PageType.ARTIST, PageType.ALBUM].includes(
          editPageType,
        )
      ) {
        await updateLibrarySongs({
          ids: [editSong.id],
          title: newTitle,
          artist,
          album,
          cover: newImage,
        });
      } else if (editSong.pageType === PageType.IMPORT) {
        const newResults = await saveImportSongEdits({
          songs: results,
          ids: [editSong.id],
          title: newTitle,
          artist,
          album,
          artwork: newImage,
        });
        setResults(newResults);
        setNumModified(numModified + 1);
      } else if (selectedSongs.length > 0) {
        const newResults = await saveImportSongEdits({
          songs: results,
          ids: selectedSongs,
          title: newTitle,
          artist,
          album,
          artwork: newImage,
        });
        setResults(newResults);
        setNumModified(numModified + 1);
      }
      setSelectEnabled(false);
    } catch (error) {
      console.log("error saving edits: ", error);
      router.back();
    }
  };

  const handleClose = () => {
    router.back();
    setSelectedSongs([]);
  };

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Edit Song</Text>
      <View style={Styles.divider} />
      <KeyboardAwareScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Text style={Styles.textboxLabel}>Cover Image</Text>
        <View style={Local.coverWrapper}>
          <EditCover
            id={id}
            image={image}
            type={CoverType.SONG}
            handlePress={() => handleUpdateImage()}
            propOnLoad={() => {}}
          />
        </View>
        <View style={Local.fileInfoContainer}>
          <Text
            style={[
              Local.name,
              {
                display: selectedSongs.length === 0 ? "flex" : "none",
              },
            ]}
          >
            {editSong.fileName ?? ""}
          </Text>
          <Text style={Local.duration}>
            {getDurationString(editSong.duration ?? 0, true)}
          </Text>
        </View>
        {selectedSongs.length === 0 && (
          <>
            <Text style={Styles.textboxLabel}>Title</Text>
            <MemoTextInput
              style={Local.textBox}
              autoCorrect={true}
              editable
              numberOfLines={1}
              defaultValue={title}
              placeholder={"Enter song name..."}
              placeholderTextColor={Colors.altDisabled}
              onEndEditing={(evt) => handleTitleUpdate(evt.nativeEvent.text)}
            />
          </>
        )}
        <View style={ModalStyles.fieldWrapper}>
          <Text style={ModalStyles.fieldLabel}>Albums</Text>
          <View style={Local.albumWrapper}>
            {albums.length === 0 && (
              <Text style={ModalStyles.emptyListFiller}>No albums</Text>
            )}
            {albums.length > 0 &&
              albums.map((album) => {
                return (
                  <AlbumItem
                    key={album.id}
                    album={album}
                    allowInteraction={false}
                  />
                );
              })}
          </View>
          <CustomButton
            title={"Add to Albums"}
            handlePress={() => router.push("/album/add")}
            buttonWidth={"90%"}
          />
        </View>
        <View style={ModalStyles.fieldWrapper}>
          <Text style={ModalStyles.fieldLabel}>Artists</Text>
          <View style={Local.artistWrapper}>
            {artists.length === 0 && (
              <Text style={ModalStyles.emptyListFiller}>No artists</Text>
            )}
            {artists.length > 0 &&
              artists.map((artist) => {
                return (
                  <ArtistItem
                    key={artist.id}
                    artist={artist}
                    allowInteraction={false}
                  />
                );
              })}
          </View>
          <CustomButton
            title={"Add Artists"}
            handlePress={() => router.push("/artist/add?sourceType=song")}
            buttonWidth={"90%"}
          />
        </View>
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View
        style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}
      >
        <CustomButton title="Close" handlePress={handleClose} />
      </View>
    </View>
  );
};

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  scrollView: {
    width: "100%",
    paddingTop: 20,
  },
  scrollViewContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  coverWrapper: {
    width: "90%",
    marginBottom: 20,
  },
  fileInfoContainer: {
    width: "90%",
    marginBottom: 20,
    gap: 5,
  },
  name: {
    ...Styles.h5,
    color: Colors.text,
    width: "90%",
  },
  duration: {
    ...Styles.h6,
    color: Colors.infoText,
    width: "90%",
  },
  bottomButtonsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  fieldWrapper: {
    width: "90%",
    marginVertical: 20,
  },
  textBox: {
    ...Styles.textbox,
    ...Styles.roundedContainer,
    fontSize: 16,
    marginBottom: 20,
    width: "90%",
  },
  notifications: {
    position: "absolute",
    bottom: 100,
  },
  artistWrapper: {
    width: "100%",
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  albumWrapper: {
    width: "100%",
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default EditSong;
