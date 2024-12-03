import SheetOption from '@/components/sheet/SheetOption';
import { PageType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import { useEffect, useState } from 'react';  
import BottomSheet from '@gorhom/bottom-sheet';
import { exportSongs } from '@/lib/SongManager';
import { useThemeContext } from '@/context/ThemeProvider';
import { usePremiumContext } from '@/context/PremiumProvider';
import { deletePlaylist, getPlaylistSongs } from '@/lib/PlaylistManager';
import { getSongByResult } from '@/lib/SongManager';
import { Alert } from 'react-native';
import { router } from 'expo-router';

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
      setPageType(editPlaylist.pageType);
    }
  }, [editPlaylist]);

  const actionDelay = 10;

  const handleEdit = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      router.push(`/playlist/edit/${editPlaylist.id}`);
    }, actionDelay);
  }

  const handleExport = async () => {
    try {
      setShowGlobalLoading(true);
      let songs = await getPlaylistSongs(editPlaylist.id);
      await exportSongs(songs);
      setShowGlobalLoading(false);
    }
    catch (error) {
      console.log('error exporting song: ', error);
      setShowGlobalLoading(false);
    }
  }

  const handleDelete = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      Alert.alert(
        'Delete Playlist',
        `Are you sure you want to delete ${editPlaylist.name ?? 'this playlist'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {
            deletePlaylist(editPlaylist.id);
            setNumModified(numModified + 1);
          }}
        ]
      )
    }, actionDelay);
  }

  return (
    <>
      <SheetOption 
        icon={require('@/assets/icons/edit.png')}
        text={'Edit'}
        show={[PageType.LIBRARY].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption 
        icon={require('@/assets/icons/share.png')}
        text={'Export'}
        show={[PageType.LIBRARY].includes(pageType) && premium}
        handler={handleExport}
      />
      <SheetOption
        icon={require('@/assets/icons/delete.png')}
        text={'Delete'}
        show={[PageType.LIBRARY].includes(pageType) && editPlaylist.id !== 1}
        handler={handleDelete}
      />
    </>
  )
}

export default PlaylistOptions;