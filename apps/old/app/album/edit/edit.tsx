import { memo, useEffect, useState } from "react";
import EditCover from "@/src/components/cover/EditCover";
import CustomButton from "@/src/components/CustomButton";
import ArtistItem from "@/src/components/lists/artist/ArtistItem";
import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import Notifications from "@/src/components/notifications";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { ArtistType, CoverType, NotificationType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import {
  getAlbumInfo,
  getArtistsFromAlbum,
  updateAlbum,
} from "@/src/controllers/AlbumController";
import { newCover } from "@/src/controllers/ImageController";
import artistBus from "@/src/events/artist";
import { ArtistBusEvent } from "@/src/events/artist/Events";
import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoTextInput = memo(TextInput);

const EditAlbum = ({ id }: { id: number }) => {
  const insets = useSafeAreaInsets();
  const { addNotification } = useGlobalContext();
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [originalYear, setOriginalYear] = useState<number | null>(null);
  const [artists, setArtists] = useState<ArtistType[]>([]);

  const refreshInfo = async () => {
    try {
      const result = await getAlbumInfo(id);
      setName(result?.name ?? null);
      setYear(result?.year ?? null);
      setOriginalName(result?.name ?? null);
      setOriginalYear(result?.year ?? null);
    } catch (error) {
      console.error("error getting album info:", error);
    }
  };

  const loadArtists = async () => {
    const artists = await getArtistsFromAlbum(id);
    setArtists(artists);
  };

  const handleArtistToggled = () => {
    loadArtists();
  };

  useEffect(() => {
    artistBus.on(ArtistBusEvent.ARTIST_TOGGLED_ON_ALBUM, handleArtistToggled);
    return () => {
      artistBus.off(
        ArtistBusEvent.ARTIST_TOGGLED_ON_ALBUM,
        handleArtistToggled,
      );
    };
  }, []);

  const nameInputValidation = async (text: string) => {
    try {
      if (text === "") {
        throw new Error("Name is required");
      } else {
        setName(text);
        await updateAlbum(id, text, year, image);
      }
    } catch (error) {
      const trace = error instanceof Error ? error.message : String(error);
      addNotification(
        NotificationType.ERROR,
        "Error",
        trace,
        "Unable to update album",
        trace,
        () => {},
      );
    }
  };

  const yearInputValidation = async (text: string) => {
    try {
      const yearNum = text ? parseInt(text) : null;
      setYear(yearNum);
      await updateAlbum(id, name, yearNum, image);
    } catch (error) {
      const trace = error instanceof Error ? error.message : String(error);
      addNotification(
        NotificationType.ERROR,
        "Error",
        trace,
        "Unable to update album",
        trace,
        () => {},
      );
    }
  };

  const handleUpdateImage = async () => {
    const cover = await newCover();
    if (cover) {
      setImage(cover);
      await updateAlbum(
        id,
        name === originalName ? null : name,
        year === originalYear ? undefined : year,
        cover,
      );
    }
  };

  useEffect(() => {
    refreshInfo();
    loadArtists();
  }, [id]);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Edit Album</Text>
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
            type={CoverType.ALBUM}
            handlePress={() => handleUpdateImage()}
            propOnLoad={() => {}}
          />
        </View>
        <Text style={Styles.textboxLabel}>Name</Text>
        <MemoTextInput
          style={Local.textBox}
          autoCorrect={true}
          editable
          numberOfLines={1}
          placeholder={"Enter album name..."}
          placeholderTextColor={Colors.altDisabled}
          defaultValue={name}
          onEndEditing={(evt) => nameInputValidation(evt.nativeEvent.text)}
        />
        <Text style={Styles.textboxLabel}>Year</Text>
        <MemoTextInput
          style={Local.textBox}
          autoCorrect={false}
          editable
          numberOfLines={1}
          keyboardType="numeric"
          placeholder={"Enter album year..."}
          placeholderTextColor={Colors.altDisabled}
          defaultValue={year?.toString()}
          onEndEditing={(evt) => yearInputValidation(evt.nativeEvent.text)}
        />
        <View style={[ModalStyles.fieldWrapper, { paddingBottom: 20 }]}>
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
            handlePress={() => router.push("/artist/add?sourceType=album")}
            buttonWidth={"90%"}
          />
        </View>
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View
        style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}
      >
        <CustomButton title="Close" handlePress={() => router.back()} />
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
  },
  header: {
    ...Styles.h2,
    color: Colors.text,
    marginBottom: 20,
  },
  coverWrapper: {
    width: "90%",
    marginBottom: 20,
  },
  name: {
    ...Styles.h3,
    color: Colors.infoText,
    width: "90%",
    marginBottom: 20,
  },
  bottomButtonsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  textBox: {
    fontSize: 16,
    marginBottom: 20,
    ...Styles.textbox,
    ...Styles.roundedContainer,
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
});

export default EditAlbum;
