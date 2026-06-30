import React, { memo, useCallback } from "react";
import List from "@/src/shared/components/List";
import Song from "@/src/features/library/components/song";
import { DraggableSongItem } from "@/src/features/library/components/lists/song/DraggableSongItem";
import {
  PageType,
  SongType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { generateSongKey } from "@/src/features/library/lib/song-display";
import { useActiveQueueTrack } from "@/src/features/playback/hooks/use-active-queue-track";
import { useSongPlaybackHandler } from "@/src/features/playback/hooks/use-song-playback-handler";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { FlatList } from "react-native";
import DraggableFlatlist, {
  DragEndParams,
  RenderItemParams,
} from "react-native-draggable-flatlist";

const MemoSong = memo(Song);

const SongList = memo(
  ({
    songs,
    headerComponent,
    footerComponent,
    bottomPadding = false,
    pageType,
    fadeCover = true,
    fadeSong = false,
    sourceId,
    sourceType,
    setScrollPosition,
    hideTopGradient = false,
    hideBottomGradient = false,
    gradientStart,
    gradientEnd,
    emptyComponent,
    showEmptyComponent,
    lockScroll = false,
    listRef,
    dragRef,
    sort,
    order,
    query,
    draggable,
    onDragEnd,
  }: {
    songs: SongType[];
    headerComponent?: React.ReactNode;
    footerComponent?: React.ReactNode;
    bottomPadding?: boolean;
    pageType: PageType;
    fadeCover?: boolean;
    fadeSong?: boolean;
    sourceId?: number;
    sourceType?: SourceType;
    setScrollPosition?: (position: number) => void;
    hideTopGradient?: boolean;
    hideBottomGradient?: boolean;
    gradientStart?: string;
    gradientEnd?: string;
    emptyComponent?: React.ReactNode;
    showEmptyComponent?: boolean;
    lockScroll?: boolean;
    listRef?: React.RefObject<FlatList<any>>;
    dragRef?: React.RefObject<typeof DraggableFlatlist<any>>;
    sort?: SortType;
    order?: SortOrder;
    query?: string;
    draggable?: boolean;
    onDragEnd?: (params: DragEndParams<any>) => void;
  }) => {
    const { selectedId } = useImportFlowContext();
    const { activeIndex, activeTrack } = useActiveQueueTrack();
    const { sendHaptic } = useHaptics();

    const selectedSort = sort ?? SortType.DATE;
    const selectedOrder = order ?? SortOrder.DESC;
    const selectedQuery = query ?? "";
    const { handlePlay } = useSongPlaybackHandler({
      activeTrack,
      sourceId,
      sourceType,
      sort: selectedSort,
      order: selectedOrder,
      query: selectedQuery,
    });

    const renderItem = ({ item, index }: { item: SongType; index: number }) => {
      item.pageType = pageType;
      item.sourceId = sourceId;
      item.sourceType = sourceType;
      let active, previous;
      if (pageType === PageType.QUEUE) {
        active = activeTrack?.id === item.id && index === activeIndex;
        previous = index < activeIndex;
      } else {
        active = activeTrack?.id === item.id;
        previous = false;
      }
      return (
        <MemoSong
          song={item}
          fadeCover={fadeCover}
          fadeSong={fadeSong}
          active={active}
          previous={previous}
          handlePlay={handlePlay}
        />
      );
    };

    const draggableItem = useCallback(
      (params: RenderItemParams<SongType>) => (
        <DraggableSongItem
          {...params}
          activeIndex={activeIndex}
          activeTrack={activeTrack}
          draggable={draggable}
          fadeCover={fadeCover}
          fadeSong={fadeSong}
          pageType={pageType}
          sendHaptic={sendHaptic}
          sourceId={sourceId}
          sourceType={sourceType}
        />
      ),
      [
        pageType,
        sourceId,
        sourceType,
        activeTrack,
        activeIndex,
        fadeCover,
        fadeSong,
        draggable,
        sendHaptic,
      ],
    );

    const getItemLayout = (
      data: ArrayLike<SongType> | null | undefined,
      index: number,
    ) => ({
      length: 70,
      offset: 70 * index,
      index,
    });

    return (
      <>
        <List
          data={songs}
          listRef={listRef}
          dragRef={dragRef}
          headerComponent={headerComponent}
          footerComponent={footerComponent}
          item={renderItem}
          keyExtractor={(song, index) => generateSongKey(song)}
          extra={selectedId}
          setScrollPosition={setScrollPosition}
          hideTopGradient={hideTopGradient}
          hideBottomGradient={hideBottomGradient}
          gradientStart={gradientStart}
          gradientEnd={gradientEnd}
          emptyComponent={emptyComponent}
          showEmptyComponent={showEmptyComponent}
          lockScroll={lockScroll}
          getItemLayout={getItemLayout}
          draggable={draggable}
          draggableItem={draggableItem}
          onDragEnd={onDragEnd}
        />
      </>
    );
  },
);

SongList.displayName = "SongList";

export default SongList;
