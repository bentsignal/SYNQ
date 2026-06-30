import React, { useEffect, useRef, useState } from "react";
import ListCover from "@/src/features/cover/components/ListCover";
import Sheet from "@/src/features/action-sheet/components";
import SheetStyles from "@/src/features/action-sheet/components/Styles";
import SongInfo from "@/src/components/song/SongInfo";
import { CoverType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { getLibrarySongCoverPath } from "@/src/features/library/repository/library-song-repository";
import { Dimensions, ScrollView, View } from "react-native";
import SongOptions from "./SongOptions";

type SongSheetProps = {
  name: string;
};

const SongSheet = ({ name }: SongSheetProps) => {
  const { editSong } = useActionSheetContext();
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [emptyCover, setEmptyCover] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const onChange = (index: number) => {
    if (index === 0) {
      setScrollEnabled(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (index === 1) {
      setScrollEnabled(true);
    }
  };

  const loadCover = async () => {
    try {
      if (editSong.artwork) {
        setCoverImage(editSong.artwork);
        setEmptyCover(false);
      } else {
        const cover = await getLibrarySongCoverPath(editSong.id);
        if (cover) {
          setCoverImage(cover);
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

  useEffect(() => {
    loadCover();
  }, [editSong]);

  return (
    <Sheet name={name} onChange={onChange}>
      <View style={SheetStyles.infoContainer}>
        <ListCover
          type={CoverType.SONG}
          image={coverImage}
          propOnLoad={() => {}}
          empty={emptyCover}
        />
        <SongInfo
          fileName={editSong.fileName}
          title={editSong.title}
          artist={editSong.artist}
          album={editSong.album}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        style={{
          height: Dimensions.get("window").height,
        }}
        contentContainerStyle={{
          paddingBottom: 300,
        }}
      >
        <SongOptions name={name} library={true} />
      </ScrollView>
    </Sheet>
  );
};

export default SongSheet;
