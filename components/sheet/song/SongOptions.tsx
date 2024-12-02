import SheetOption from '@/components/sheet/SheetOption';
import { PageType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import { addToQueue } from '@/lib/PlayerManager';
import { getTrackFromSong } from '@/lib/PlayerManager';
import playlistBus from '@/station/playlistBus';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';  
import BottomSheet from '@gorhom/bottom-sheet';
import { exportSongs } from '@/lib/SongManager';
import { useThemeContext } from '@/context/ThemeProvider';
import { usePremiumContext } from '@/context/PremiumProvider';
import { removeFromPlaylist } from '@/lib/PlaylistManager';

type SongOptionsProps = {
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const SongOptions = ({ bottomSheetRef }: SongOptionsProps) => {

  const { 
    
    editSong,
    numModified,
    haptic,

    setShowEdit, setShowImportAd,
    setShowDelete, setShowOverlay, 
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
      setShowOverlay(true);
      setShowEdit(true);
    }, actionDelay);
  }

  const handleExport = async () => {
    try {
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

  const handleDeleteSong = () => {
    bottomSheetRef.current?.close();
    if (pageType === PageType.IMPORT && !premium) {
      setShowImportAd(true);
    }
    setTimeout(() => {
      setShowOverlay(true);
      setShowDelete(true);
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
        playlistBus.emit('playlistChangesMade');
      }, 200);
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
        show={[PageType.LIBRARY].includes(pageType) 
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
        show={[PageType.LIBRARY, PageType.IMPORT].includes(pageType)}
        handler={handleEditSong}
      />
      <SheetOption 
        icon={require('@/assets/icons/share.png')}
        text={'Export'}
        show={[PageType.LIBRARY].includes(pageType)}
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