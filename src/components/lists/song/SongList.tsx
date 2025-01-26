import React, { memo, useEffect, useState, useCallback } from 'react';
import { SongType, PageType, SourceType } from '@/src/constants/Types';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import Song from '@/src/components/song';
import { generateSongKey } from '@/src/controllers/SongController';
import List from '@/src/components/List';
import { useActiveTrack } from 'react-native-track-player';
import { addToQueue, getTrackFromSong, 
  updateQueue, playAd, playTrack } from '@/src/controllers/PlayerController';
import * as Haptics from 'expo-haptics';
import { usePlaybackContext } from '@/src/context/PlaybackProvider';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { usePremiumContext } from '@/src/context/PremiumProvider';

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
    gradientStart,
    gradientEnd,
    emptyComponent,
    showEmptyComponent,
    lockScroll = false,
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
    gradientStart?: string,
    gradientEnd?: string,
    emptyComponent?: React.ReactNode,
    showEmptyComponent?: boolean,
    lockScroll?: boolean,
  }
) => {

  const { selectedId, haptic, adPlaying, setAdPlaying, shouldPlayAd, adURL } = useGlobalContext();
  const { shuffle, setSourceType, setSourceId } = usePlaybackContext();
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
  const activeTrack = useActiveTrack();

  const handlePlay = useCallback(async (song: SongType) => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const id = activeTrack?.id ? activeTrack.id : -1;
    // play ad if user is non premium and has passed ad threshold
    if (!premium && shouldPlayAd && !adPlaying) {
      setAdPlaying(true);
      await playAd(theme, adURL);
      const newTrack = await getTrackFromSong(song, theme);
      await updateQueue(song.id, shuffle, theme, song.sourceType, song.sourceId);
      setSourceType(song.sourceType);
      setSourceId(song.sourceId);
      if (newTrack) {
        await addToQueue(newTrack);
      }
    }
    // if ad is not played, play song
    else if (id !== song.id && !adPlaying) {
      setAdPlaying(false);
      try {
        const newTrack = await getTrackFromSong(song, theme);
        if (newTrack) {
          await playTrack(newTrack);
          await updateQueue(song.id, shuffle, theme, song.sourceType, song.sourceId);
          setSourceType(song.sourceType);
          setSourceId(song.sourceId);
        }
      }
      catch (error) {
        console.log('error playing song: ', error);
      }
    }
  }, [haptic, premium, shouldPlayAd, adPlaying, theme, adURL, shuffle, setAdPlaying, setSourceType, setSourceId]);

  const renderItem = ({item} : {item: SongType}) => {
    item.pageType = pageType;
    item.sourceId = sourceId;
    item.sourceType = sourceType;
    return (
      <MemoSong 
        song={item}
        fadeCover={fadeCover}
        fadeSong={fadeSong}
        active={activeTrack?.id === item.id}
        handlePlay={handlePlay}
      />
    );
  };

  return (
    <>
      <List 
        data={songs}
        headerComponent={headerComponent}
        footerComponent={footerComponent}
        item={renderItem}
        keyExtractor={(song, index) => generateSongKey(song)}
        extra={selectedId}
        setScrollPosition={setScrollPosition}
        gradientStart={gradientStart}
        gradientEnd={gradientEnd}
        emptyComponent={emptyComponent}
        showEmptyComponent={showEmptyComponent}
        lockScroll={lockScroll}
      />
    </>
  );

});

export default SongList;
