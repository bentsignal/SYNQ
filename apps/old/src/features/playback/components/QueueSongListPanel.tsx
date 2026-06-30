import SongList from "@/src/components/lists/song";
import { PageType } from "@/src/constants/Types";
import { usePlaybackQueueDisplay } from "@/src/features/playback/hooks/use-playback-queue-display";
import { useRef } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

export const QueueSongListPanel = () => {
  const listRef = useRef<any>(null);
  const { listContainerStyle, onDragEnd, songs } = usePlaybackQueueDisplay({
    listRef,
  });

  return (
    <Animated.View style={listContainerStyle}>
      <SongList
        songs={songs}
        pageType={PageType.QUEUE}
        hideTopGradient={true}
        gradientStart={"rgba(24, 24, 24, 1)"}
        gradientEnd={"rgba(24, 24, 24, 0)"}
        dragRef={listRef}
        footerComponent={<View style={{ height: 500 }} />}
        draggable={true}
        onDragEnd={onDragEnd}
      />
    </Animated.View>
  );
};
