import { useEffect, useState } from "react";
import CategorySelector from "@/src/components/CategorySelector";
import Albums from "@/src/components/library/Albums";
import Artists from "@/src/components/library/Artists";
import Playlists from "@/src/components/library/Playlists";
import Songs from "@/src/components/library/Songs";
import PageTitle from "@/src/components/PageTitle";
import Plus from "@/src/components/Plus";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import playlistBus from "@/src/events/playlist/Bus";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import { router } from "expo-router";
import { Cog } from "lucide-react-native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

const Library = () => {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const resetTab = () => {
      setSelected(0);
    };
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, resetTab);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, resetTab);
    };
  }, []);

  const getBody = () => {
    switch (selected) {
      case 0:
        return <Songs />;
      case 1:
        return <Playlists />;
      case 2:
        return <Albums />;
      case 3:
        return <Artists />;
    }
  };

  const handleCreate = () => {
    switch (selected) {
      case 1:
        router.push("/playlist/create");
        break;
      case 2:
        router.push("/album/create");
        break;
      case 3:
        router.push("/artist/create");
        break;
    }
  };

  return (
    <View style={Styles.body}>
      <PageTitle
        title="Library"
        rightHandComponent={
          <View style={Local.buttonsContainer}>
            <TouchableOpacity
              onPress={handleCreate}
              style={{ display: selected === 0 ? "none" : "flex" }}
            >
              <Plus />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Cog size={25} color={Colors.text} />
            </TouchableOpacity>
          </View>
        }
      />
      <CategorySelector
        containerStyle={{
          width: "90%",
        }}
        callback={setSelected}
      />
      <View style={Styles.divider} />
      {getBody()}
    </View>
  );
};

const Local = StyleSheet.create({
  buttonsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    gap: 20,
  },
  icon: {
    height: 25,
    width: 25,
  },
});

export default Library;
