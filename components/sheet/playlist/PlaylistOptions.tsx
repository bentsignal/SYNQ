import SheetOption from '@/components/sheet/SheetOption';
import { PageType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import { useEffect, useState } from 'react';
import { exportSongs } from '@/lib/controllers/ImportExportController';
import { useThemeContext } from '@/context/ThemeProvider';
import { usePremiumContext } from '@/context/PremiumProvider';
import { deletePlaylist, getPlaylistSongs } from '@/lib/controllers/PlaylistController';
import { getSongByResult } from '@/lib/controllers/SongController';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { PlaylistBusEvent } from '@/src/events/playlist/Events';
import playlistBus from '@/src/events/playlist';
import { TrueSheet } from '@lodev09/react-native-true-sheet';


const PlaylistOptions = ({name}: {name: string}) => {

  const { editPlaylist, setShowGlobalLoading } = useGlobalContext();

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
    TrueSheet.dismiss(name);
    setTimeout(() => {
      router.push(`/playlist/edit/${editPlaylist.id}`);
    }, actionDelay);
  }

  const handleExport = async () => {
    try {
      TrueSheet.dismiss(name);
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

  const executeDelete = async () => {
    try {
      await deletePlaylist(editPlaylist.id);
      playlistBus.emit(PlaylistBusEvent.PLAYLIST_DELETED);
    }
    catch (error) {
      console.log('error deleting playlist: ', error);
    }
  }

  const handleDelete = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      Alert.alert(
        'Delete Playlist',
        `Are you sure you want to delete ${editPlaylist.name ?? 'this playlist'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {
            if (pageType === PageType.PLAYLIST) {
              router.back();
              setTimeout(() => {
                executeDelete();
              }, 300);
            }
            else {
              executeDelete();
            }
          }}
        ]
      );
    }, actionDelay);
  }

  return (
    <>
      <SheetOption 
        icon={require('@/assets/icons/edit.png')}
        text={'Edit'}
        show={[PageType.LIBRARY, PageType.PLAYLIST].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption 
        icon={require('@/assets/icons/share.png')}
        text={'Export'}
        show={[PageType.LIBRARY, PageType.PLAYLIST].includes(pageType) && premium}
        handler={handleExport}
      />
      <SheetOption
        icon={require('@/assets/icons/delete.png')}
        text={'Delete'}
        show={[PageType.LIBRARY, PageType.PLAYLIST].includes(pageType) && editPlaylist.id !== 2}
        handler={handleDelete}
      />
    </>
  )
}

export default PlaylistOptions;