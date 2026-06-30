import Song from "@/src/components/song";
import { PageType, SongType, SourceType } from "@/src/constants/Types";
import React, { memo } from "react";
import { TouchableOpacity } from "react-native";
import { type RenderItemParams } from "react-native-draggable-flatlist";
import { type Track } from "react-native-track-player";

type DraggableSongItemProps = RenderItemParams<SongType> & {
  activeIndex: number;
  activeTrack?: Track;
  draggable?: boolean;
  fadeCover: boolean;
  fadeSong: boolean;
  pageType: PageType;
  sendHaptic: (type: "light") => void;
  sourceId?: number;
  sourceType?: SourceType;
};

const MemoSong = memo(Song);

const noopHandlePlay = async (_song: SongType) => {};

export const DraggableSongItem = ({
  activeIndex,
  activeTrack,
  drag,
  draggable,
  fadeCover,
  fadeSong,
  getIndex,
  item,
  pageType,
  sendHaptic,
  sourceId,
  sourceType,
}: DraggableSongItemProps) => {
  item.pageType = pageType;
  item.sourceId = sourceId;
  item.sourceType = sourceType;
  const index = getIndex();
  let active, previous;
  if (pageType === PageType.QUEUE) {
    active = activeTrack?.id === item.id && index === activeIndex;
    previous = index !== undefined && index < activeIndex;
  } else {
    active = activeTrack?.id === item.id;
    previous = false;
  }

  return (
    <TouchableOpacity
      style={{ width: "100%" }}
      onLongPress={() => {
        if (
          pageType === PageType.QUEUE &&
          index !== undefined &&
          index <= activeIndex
        ) {
          return;
        }
        sendHaptic("light");
        drag();
      }}
    >
      <MemoSong
        song={item}
        fadeCover={fadeCover}
        fadeSong={fadeSong}
        active={active}
        previous={previous}
        handlePlay={noopHandlePlay}
        draggable={draggable}
      />
    </TouchableOpacity>
  );
};
