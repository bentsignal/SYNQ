import { useEffect, useState } from "react";
import CategorySelector from "@/src/features/library/components/CategorySelector";
import Albums from "@/src/features/library/components/Albums";
import Artists from "@/src/features/library/components/Artists";
import Playlists from "@/src/features/library/components/Playlists";
import Songs from "@/src/features/library/components/Songs";
import PageTitle from "@/src/shared/components/PageTitle";
import { Styles } from "@/src/constants/Styles";
import colors from "@/src/lib/colors";
import { router, useLocalSearchParams } from "expo-router";
import { Cog, PlusIcon } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const Library = () => {
  const { category, resetKey } = useLocalSearchParams<{
    category?: string;
    resetKey?: string;
  }>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (category === "songs") {
      setSelected(0);
    }
  }, [category, resetKey]);

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
              <PlusIcon size={24} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Cog size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        }
      />
      <CategorySelector
        containerStyle={{
          width: "90%",
        }}
        selected={selected}
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
