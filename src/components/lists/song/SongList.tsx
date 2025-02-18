import React, { memo, useCallback, useEffect, useState } from 'react';
import { SongType, PageType, SourceType, SortType, SortOrder } from '@/src/constants/Types';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import Song from '@/src/components/song';
import { generateSongKey } from '@/src/controllers/SongController';
import List from '@/src/components/List';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';
import { getTrackFromSong, playAd, playTrack } from '@/src/controllers/PlayerController';
import * as Haptics from 'expo-haptics';
import { usePlaybackContext } from '@/src/context/PlaybackProvider';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { usePremiumContext } from '@/src/context/PremiumProvider';
import { FlatList, TouchableOpacity } from 'react-native';
import { check } from '@/lib/Util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import usePlayer from '@/src/hooks/usePlayer';
import { usePostHog } from 'posthog-react-native';
import DraggableFlatlist, { DragEndParams, RenderItemParams } from 'react-native-draggable-flatlist';

const MemoSong = memo(Song);

const SongList = memo((
  {
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
  }: 
  {
    songs: SongType[], 
    headerComponent?: React.ReactNode,
    footerComponent?: React.ReactNode,
    bottomPadding?: boolean,
    pageType: PageType,
    fadeCover?: boolean,
    fadeSong?: boolean,
    sourceId?: number,
    sourceType?: SourceType,
    setScrollPosition?: (position: number) => void,
    hideTopGradient?: boolean,
    hideBottomGradient?: boolean,
    gradientStart?: string,
    gradientEnd?: string,
    emptyComponent?: React.ReactNode,
    showEmptyComponent?: boolean,
    lockScroll?: boolean,
    listRef?: React.RefObject<FlatList<any>>,
    dragRef?: React.RefObject<typeof DraggableFlatlist<any>>,
    sort?: SortType,
    order?: SortOrder,
    query?: string,
    draggable?: boolean,
    onDragEnd?: (params: DragEndParams<any>) => void,
  }
) => {

  const { selectedId, haptic, adPlaying, setAdPlaying, shouldPlayAd, adURL } = useGlobalContext();
  const { shuffle, setSourceType, setSourceId, setSort, setOrder, setQuery } = usePlaybackContext();
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
  const activeTrack = useActiveTrack();
  const posthog = usePostHog();
  const { addToQueue, updateQueue } = usePlayer();
  
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = async () => {
    const index = await TrackPlayer.getActiveTrackIndex();
    if (check(index)) {
      setActiveIndex(index);
    }
  }

  useEffect(() => {
    updateActiveIndex();
  }, [activeTrack]);

  const handlePlay = useCallback(async (song: SongType) => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const id = activeTrack?.id ? activeTrack.id : -1;
    // play ad if user is non premium and has passed ad threshold
    if (!premium && shouldPlayAd && !adPlaying) {
      posthog.capture('play_ad');
      setAdPlaying(true);
      await playAd(theme, adURL);
      const newTrack = await getTrackFromSong(song, theme);
      await updateQueue(
        song.id, 
        shuffle, 
        song.sourceType, 
        song.sourceId, 
        sort,
        order,
        query
      );
      setSourceType(song.sourceType);
      await AsyncStorage.setItem('sourceType', song.sourceType.toString());
      setSourceId(song.sourceId);
      await AsyncStorage.setItem('sourceId', song.sourceId.toString());
      setSort(sort);
      setOrder(order);
      setQuery(query);
      if (newTrack) {
        await addToQueue(newTrack);
      }
    }
    // if ad is not played, play song
    else if (id !== song.id && !adPlaying) {
      posthog.capture('play_song');
      setAdPlaying(false);
      try {
        const newTrack = await getTrackFromSong(song, theme);
        if (newTrack) {

          await playTrack(newTrack);
          await updateQueue(
            song.id, 
            shuffle, 
            song.sourceType, 
            song.sourceId, 
            sort, 
            order, 
            query
          );
          setSourceType(song.sourceType);
          await AsyncStorage.setItem('sourceType', song.sourceType.toString());
          setSourceId(song.sourceId);
          await AsyncStorage.setItem('sourceId', song.sourceId.toString());
          setSort(sort);
          setOrder(order);
          setQuery(query);
        }
      }
      catch (error) {
        console.log('error playing song: ', error);
      }
    }
  }, [
    haptic, premium, shouldPlayAd, adPlaying, theme, 
    adURL, shuffle, setAdPlaying, setSourceType, 
    setSourceId, sort, order, query
  ]);

  const renderItem = ({item, index} : {item: SongType, index: number}) => {
    item.pageType = pageType;
    item.sourceId = sourceId;
    item.sourceType = sourceType;
    let active, previous;
    if (pageType === PageType.QUEUE) {
      active = activeTrack?.id === item.id && index === activeIndex;
      previous = index < activeIndex;
    }
    else {
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

  const draggableItem = useCallback(({item, getIndex, drag, isActive} : RenderItemParams<SongType>) => {
    item.pageType = pageType;
    item.sourceId = sourceId;
    item.sourceType = sourceType;
    let active, previous;
    if (pageType === PageType.QUEUE) {
      active = activeTrack?.id === item.id && getIndex() === activeIndex;
      previous = getIndex() < activeIndex;
    }
    else {
      active = activeTrack?.id === item.id;
      previous = false;
    }
    return (
      <TouchableOpacity
        style={{width: '100%'}}
        onLongPress={() => {
          if (getIndex() > activeIndex) {
            if (haptic) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            drag();
          }
        }}
      >
        <MemoSong 
          song={item}
          fadeCover={fadeCover}
          fadeSong={fadeSong}
          active={active}
          previous={previous}
          handlePlay={handlePlay}
        />
      </TouchableOpacity>
    );
  }, [
    pageType, sourceId, sourceType, activeTrack, activeIndex, 
    handlePlay, fadeCover, fadeSong
  ]);

  const getItemLayout = (data: SongType[], index: number) => ({
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

});

export default SongList;
