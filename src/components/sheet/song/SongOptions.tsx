import { Alert } from 'react-native';
import { useEffect, useState } from 'react';  
import SheetOption from '@/src/components/sheet/SheetOption';
import { PageType, SourceType } from '@/src/constants/Types';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { getTrackFromSong } from '@/src/controllers/PlayerController';
import playlistBus from '@/src/events/playlist';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { removeSongs } from '@/src/controllers/SongController';
import { exportSongs } from '@/src/controllers/ImportExportController';
import { deleteFromLibrary } from '@/src/controllers/LibraryController';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { usePremiumContext } from '@/src/context/PremiumProvider';
import { addToPlaylist, isSongInPlaylist, removeFromAllPlaylists, removeFromPlaylist } from '@/src/controllers/PlaylistController';
import { PlaylistBusEvent } from '@/src/events/playlist/Events';
import { Track } from 'react-native-track-player';
import TrackPlayer from 'react-native-track-player';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { SongBusEvent } from '@/src/events/song/Events';
import songBus from '@/src/events/song/Bus';
import usePlayer from '@/src/hooks/usePlayer';
import { usePostHog } from 'posthog-react-native';

type SongOptionsProps = {
  name: string;
  library?: boolean;
}

const SongOptions = ({ name, library = false }: SongOptionsProps) => {

  const { 
    
    editSong,
    numModified,
    haptic, selectedSongs, results,

    setExportDisabled,
    setResults,
    setShowImportAd,
    setShowGlobalLoading,
    setNumModified,

  } = useGlobalContext();

  const { addToQueue } = usePlayer();
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
  const posthog = usePostHog();

  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);
  const [inLiked, setinLiked] = useState(false);

  useEffect(() => {
    if (editSong.pageType) {
      try {
        setPageType(editSong.pageType);
        refreshinLiked(editSong.id);
      }
      catch (error) {
        console.log('error getting options for new song: ', error);
      }
    }
  }, [editSong]);

  const actionDelay = 10;

  const refreshinLiked = async (songId: number) => {
    const liked = await isSongInPlaylist(2, songId);
    setinLiked(liked);
  }

  const handleAddToQueue = () => {
    TrueSheet.dismiss(name);
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTimeout(async () => {
      const newTrack = await getTrackFromSong(editSong, theme);
      if (newTrack) {
        await addToQueue(newTrack);
      }
    }, actionDelay);
  }

  const handleEditSong = () => {
    TrueSheet.dismiss(name);
    posthog.capture('edit_song');
    setTimeout(() => {
      router.push(`/song/edit/${editSong.id}`);
    }, actionDelay);
  }

  const handleExport = async () => {
    try {
      posthog.capture('export_song');
      TrueSheet.dismiss(name);
      if (pageType === PageType.IMPORT && !premium) {
        setShowImportAd(true);
      }
      else {
        setShowImportAd(false);
      }
      setShowGlobalLoading(true);
      await exportSongs([editSong]);
      setNumModified(numModified + 1);
      setShowGlobalLoading(false);
    }
    catch (error) {
      console.log('error exporting song: ', error);
      setShowGlobalLoading(false);
    }
  }

  const executeDelete = async () => {
    posthog.capture('delete_song');
    // handle bulk delete
    if (selectedSongs.length > 0) {
      const newResults = await removeSongs(results, selectedSongs);
      if (newResults.length <= 0) {
        setExportDisabled(true);
        router.replace('/(tabs)');
      }
      setResults(newResults);
    }
    // remove from library
    else if (editSong.pageType === PageType.LIBRARY) {
      await removeFromAllPlaylists(editSong.id);
      await deleteFromLibrary(editSong.id);
      songBus.emit(SongBusEvent.SONG_DELETED)
      // remove from queue and next up if applicable
      const queue = await TrackPlayer.getQueue();
      const indiciesToRemove = queue
        .map((track: Track, index: number) => track.id === editSong.id ? index : -1)
        .filter(index => index !== -1);
      await TrackPlayer.remove(indiciesToRemove);
      setNumModified(numModified + 1);
    }
    // remove from import
    else if (editSong.pageType === PageType.IMPORT) {
      const ids = selectedSongs.length > 0 ? selectedSongs : [editSong.id]
      const newResults = await removeSongs(results, ids);
      if (newResults.length <= 0) {
        setExportDisabled(true);
      }
      if (newResults.length === 0) {
        router.replace('/(tabs)');
      }
      setResults(newResults);
    }
  }

  const handleDeleteSong = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      Alert.alert(
        `${selectedSongs.length > 1 ? 'Delete songs' : 'Delete song'}`,
        `Are you sure you want to delete ${editSong.fileName ?? 'this song'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {
            executeDelete();
          }}
        ]
      );
    }, actionDelay);
  }

  const handleAddToPlaylist = () => {
    posthog.capture('add_to_playlist');
    TrueSheet.dismiss(name);
    setTimeout(() => {
      router.push('/playlist/add');
    }, 200);
  }

  const handleRemoveFromPlaylist = async () => {
    posthog.capture('remove_from_playlist');
    TrueSheet.dismiss(name);
    try {
      await removeFromPlaylist(editSong.sourceId, editSong.id);
      setTimeout(() => {
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED);
      }, 50);
    }
    catch (error) {
      console.log('error removing from playlist: ', error);
    }
  }

  const handleToggleinLiked = async () => {
    posthog.capture('toggle_in_liked');
    TrueSheet.dismiss(name);
    try {
      if (inLiked) {
        await removeFromPlaylist(2, editSong.id);
        setinLiked(false);
      }
      else {
        await addToPlaylist(2, editSong.id);
        setinLiked(true);
      }
      setTimeout(() => {
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED);
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED, {
          id: 2,
          songCount: -1
        });
      }, 50);
    }
    catch (error) {
      console.log('error toggling in favorites: ', error);
    }
  }

  return (
    <>
      {library && 
        <>
          <SheetOption 
            icon={inLiked ? require('@/src/assets/icons/unheart.png') : require('@/src/assets/icons/heart.png')}
            text={inLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
            show={[PageType.LIBRARY, PageType.PLAYER, PageType.ARTIST, PageType.ALBUM].includes(pageType)}
            handler={handleToggleinLiked}
          />
          <SheetOption 
            icon={require('@/src/assets/icons/add.png')}
            text={'Add to Playlist'}
            show={[PageType.LIBRARY, PageType.PLAYER, PageType.ARTIST, PageType.ALBUM].includes(pageType)}
            handler={handleAddToPlaylist}
          />
          <SheetOption 
            icon={require('@/src/assets/icons/remove.png')}
            text={'Remove from Playlist'}
            show={[PageType.LIBRARY, PageType.PLAYER].includes(pageType) 
              && editSong.sourceId !== undefined
              && editSong.sourceId !== 1
              && editSong.sourceType === SourceType.PLAYLIST
            }
            handler={handleRemoveFromPlaylist}
          />
          <SheetOption 
            icon={require('@/src/assets/icons/add-to-queue.png')}
            text={'Add to Queue'}
            show={[PageType.LIBRARY, PageType.QUEUE, PageType.PLAYER, PageType.ARTIST, PageType.ALBUM].includes(pageType)}
            handler={handleAddToQueue}
          />
        </>
      }
      <SheetOption 
        icon={require('@/src/assets/icons/edit.png')}
        text={'Edit'}
        show={[PageType.LIBRARY, PageType.IMPORT, PageType.ARTIST, PageType.ALBUM].includes(pageType)}
        handler={handleEditSong}
      />
      <SheetOption
        icon={require('@/src/assets/icons/delete.png')}
        text={'Delete'}
        show={[PageType.LIBRARY, PageType.IMPORT].includes(pageType)}
        handler={handleDeleteSong}
      />
      <SheetOption 
        icon={require('@/src/assets/icons/share.png')}
        text={'Export'}
        show={[PageType.LIBRARY, PageType.PLAYER, PageType.ARTIST, PageType.ALBUM, PageType.IMPORT].includes(pageType)}
        handler={handleExport}
      />
    </>
  )
}

export default SongOptions;