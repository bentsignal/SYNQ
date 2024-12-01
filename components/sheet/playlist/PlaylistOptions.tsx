import SheetOption from '@/components/sheet/SheetOption';
import { PageType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import { useEffect, useState } from 'react';  
import BottomSheet from '@gorhom/bottom-sheet';
import { exportSongs } from '@/lib/SongManager';
import { useThemeContext } from '@/context/ThemeProvider';
import { usePremiumContext } from '@/context/PremiumProvider';
import { deletePlaylist } from '@/lib/PlaylistManager';

type PlaylistOptionsProps = {
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const PlaylistOptions = ({ bottomSheetRef }: PlaylistOptionsProps) => {

  const { 
    
    editSong,
    numModified,
    editPlaylist,
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
    if (editPlaylist.pageType) {
      console.log('editPlaylist.pageType: ', editPlaylist.pageType);
      setPageType(editPlaylist.pageType);
    }
  }, [editPlaylist]);

  const actionDelay = 10;

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
    deletePlaylist(editPlaylist.id);
    setNumModified(numModified + 1);
  }

  return (
    <>
      <SheetOption 
        icon={require('@/assets/icons/edit.png')}
        text={'Edit'}
        show={[PageType.LIBRARY].includes(pageType)}
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
        show={[PageType.LIBRARY].includes(pageType)}
        handler={handleDeleteSong}
      />
    </>
  )
}

export default PlaylistOptions;