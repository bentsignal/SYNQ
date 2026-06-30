import React, { memo, useCallback, useEffect, useState } from "react";
import List from "@/src/components/List";
import Song from "@/src/components/song";
import {
  PageType,
  SongType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { usePlaybackContext } from "@/src/features/playback/context/PlaybackProvider";
import { generateSongKey } from "@/src/controllers/SongController";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useAdGatedPlaybackCommand } from "@/src/features/playback/hooks/use-ad-gated-playback-command";
import { useHaptics } from "@/src/hooks/use-haptics";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { posthog } from "@/src/lib/posthog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlatList, TouchableOpacity } from "react-native";
import DraggableFlatlist, {
  DragEndParams,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import TrackPlayer, { useActiveTrack } from "react-native-track-player";

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
    const { shuffle, setSourceType, setSourceId, setSort, setOrder, setQuery } =
      usePlaybackContext();
    const activeTrack = useActiveTrack();
    const { sendHaptic } = useHaptics();
    const { addSongToQueue, playSong, updateQueue } = usePlayer();
    const { runAdGatedPlaybackCommand } = useAdGatedPlaybackCommand();

    const [activeIndex, setActiveIndex] = useState(0);

    const updateActiveIndex = async () => {
      const index = await TrackPlayer.getActiveTrackIndex();
      if (index !== undefined) {
        setActiveIndex(index);
      }
    };

    const selectedSort = sort ?? SortType.DATE;
    const selectedOrder = order ?? SortOrder.DESC;
    const selectedQuery = query ?? "";

    const getSongSource = (song: SongType) => ({
      id: sourceId ?? song.sourceId,
      type: sourceType ?? song.sourceType,
    });

    const persistPlaybackSource = async (
      source: { id: number; type: SourceType },
    ) => {
      setSourceType(source.type);
      await AsyncStorage.setItem("sourceType", source.type.toString());
      setSourceId(source.id);
      await AsyncStorage.setItem("sourceId", source.id.toString());
      setSort(selectedSort);
      setOrder(selectedOrder);
      setQuery(selectedQuery);
    };

    useEffect(() => {
      updateActiveIndex();
    }, [activeTrack]);

    const handlePlay = useCallback(
      async (song: SongType) => {
        sendHaptic("light");
        const id = activeTrack?.id ? activeTrack.id : -1;
        const playbackSource = getSongSource(song);
        const playbackSourceId = playbackSource.id;
        const playbackSourceType = playbackSource.type;
        const hasPlaybackSource =
          playbackSourceType !== undefined && playbackSourceId !== undefined;
        const queueSelectedTrackAfterAdStarts = async () => {
          if (hasPlaybackSource) {
            await updateQueue(
              song.id,
              shuffle,
              playbackSourceType,
              playbackSourceId,
              selectedSort,
              selectedOrder,
              selectedQuery,
            );
            await persistPlaybackSource({
              id: playbackSourceId,
              type: playbackSourceType,
            });
          }
          await addSongToQueue(song);
        };

        await runAdGatedPlaybackCommand({
          afterAdStarts: async () => {
            posthog.capture("play_ad");
            await queueSelectedTrackAfterAdStarts();
          },
          command: async () => {
            if (id === song.id) {
              return;
            }

            posthog.capture("play_song");
            try {
              const didPlaySong = await playSong(song);
              if (didPlaySong) {
                if (hasPlaybackSource) {
                  await updateQueue(
                    song.id,
                    shuffle,
                    playbackSourceType,
                    playbackSourceId,
                    selectedSort,
                    selectedOrder,
                    selectedQuery,
                  );
                  await persistPlaybackSource({
                    id: playbackSourceId,
                    type: playbackSourceType,
                  });
                }
              }
            } catch (error) {
              console.log("error playing song: ", error);
            }
          },
        });
      },
      [
        shuffle,
        setSourceType,
        setSourceId,
        selectedSort,
        selectedOrder,
        selectedQuery,
      ],
    );

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
      ({ item, getIndex, drag, isActive }: RenderItemParams<SongType>) => {
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
              handlePlay={async (song: SongType) => {}}
              draggable={draggable}
            />
          </TouchableOpacity>
        );
      },
      [
        pageType,
        sourceId,
        sourceType,
        activeTrack,
        activeIndex,
        fadeCover,
        fadeSong,
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
