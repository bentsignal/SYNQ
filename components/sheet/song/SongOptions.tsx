import { Alert } from 'react-native';
import { useEffect, useState } from 'react';  
import SheetOption from '@/components/sheet/SheetOption';
import { PageType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import { addToQueue } from '@/lib/PlayerManager';
import { getTrackFromSong } from '@/lib/PlayerManager';
import playlistBus from '@/station/playlist';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import BottomSheet from '@gorhom/bottom-sheet';
import { deleteFromLibrary, exportSongs, removeSongs } from '@/lib/SongManager';
import { useThemeContext } from '@/context/ThemeProvider';
import { usePremiumContext } from '@/context/PremiumProvider';
import { removeFromAllPlaylists, removeFromPlaylist } from '@/lib/PlaylistManager';
import { PlaylistBusEvent } from '@/station/playlist/Events';
import { Track } from 'react-native-track-player';
import TrackPlayer from 'react-native-track-player';
import { SongType } from '@/constants/Types';

type SongOptionsProps = {
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const SongOptions = ({ bottomSheetRef }: SongOptionsProps) => {

  const { 
    
    editSong,
    numModified,
    haptic, selectedSongs, results,

    setExportDisabled, setHomeState,
    setResults,
    setShowImportAd,
    setShowGlobalLoading,
    setNumModified,

  } = useGlobalContext();

  const { premium } = usePremiumContext();
  
  const { theme } = useThemeContext();

  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editSong.pageType) {
      setPageType(editSong.pageType);
    }
  }, [editSong]);

  const actionDelay = 10;

  const handleAddToQueue = () => {
    bottomSheetRef.current?.close();
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
    bottomSheetRef.current?.close();
    setTimeout(() => {
      router.push(`/song/edit/${editSong.id}`);
    }, actionDelay);
  }

  const handleExport = async () => {
    try {
      if (pageType === PageType.IMPORT && !premium) {
        setShowImportAd(true);
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
    // handle bulk delete
    if (selectedSongs.length > 0) {
      const newResults = removeSongs(results, selectedSongs);
      if (newResults.length <= 0) {
        setExportDisabled(true);
        setHomeState(0);
      }
      setResults(newResults);
    }
    // remove from library
    else if (editSong.pageType === PageType.LIBRARY) {
      deleteFromLibrary(editSong.id);
      removeFromAllPlaylists(editSong.id);
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
      const newResults = removeSongs(results, ids);
      if (newResults.length <= 0) {
        setExportDisabled(true);
      }
      if (newResults.length === 0) {
        setHomeState(0);
      }
      setResults(newResults);
    }
  }

  const handleDeleteSong = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      Alert.alert(
        `${selectedSongs.length > 1 ? 'Delete songs' : 'Delete song'}`,
        `Are you sure you want to delete ${editSong.name ?? 'this song'}?`,
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
    bottomSheetRef.current?.close();
    setTimeout(() => {
      router.push('/playlist/add');
    }, 200);
  }

  const handleRemoveFromPlaylist = async () => {
    bottomSheetRef.current?.close();
    try {
      await removeFromPlaylist(editSong.playlistId, editSong.id);
      setTimeout(() => {
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED);
      }, 50);
    }
    catch (error) {
      console.log('error removing from playlist: ', error);
    }
  }

  return (
    <>
      <SheetOption 
        icon={require('@/assets/icons/add.png')}
        text={'Add to Playlist'}
        show={[PageType.LIBRARY, PageType.PLAYER].includes(pageType)}
        handler={handleAddToPlaylist}
      />
      <SheetOption 
        icon={require('@/assets/icons/remove.png')}
        text={'Remove from Playlist'}
        show={[PageType.LIBRARY, PageType.PLAYER].includes(pageType) 
          && editSong.playlistId !== undefined
          && editSong.playlistId !== '1'
        }
        handler={handleRemoveFromPlaylist}
      />
      <SheetOption 
        icon={require('@/assets/icons/add-to-queue.png')}
        text={'Add to Queue'}
        show={[PageType.LIBRARY, PageType.QUEUE, PageType.PLAYER].includes(pageType)}
        handler={handleAddToQueue}
      />
      <SheetOption 
        icon={require('@/assets/icons/edit.png')}
        text={'Edit'}
        show={[PageType.LIBRARY, PageType.IMPORT, PageType.PLAYER].includes(pageType)}
        handler={handleEditSong}
      />
      <SheetOption 
        icon={require('@/assets/icons/share.png')}
        text={'Export'}
        show={[PageType.LIBRARY, PageType.PLAYER].includes(pageType)}
        handler={handleExport}
      />
      <SheetOption
        icon={require('@/assets/icons/delete.png')}
        text={'Delete'}
        show={[PageType.LIBRARY, PageType.IMPORT].includes(pageType)}
        handler={handleDeleteSong}
      />
    </>
  )
}

export default SongOptions;