import SheetOption from '@/src/components/sheet/SheetOption';
import { PageType } from '@/src/constants/Types';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { useEffect, useState } from 'react';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { usePremiumContext } from '@/src/context/PremiumProvider';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { AlbumBusEvent } from '@/src/events/album/Events';
import albumBus from '@/src/events/album';
import { deleteAlbum } from '@/lib/controllers/AlbumController';

const AlbumOptions = ({name}: {name: string}) => {

  const { editAlbum, setShowGlobalLoading } = useGlobalContext();

  const { premium } = usePremiumContext();
  
  const { theme } = useThemeContext();

  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editAlbum.pageType) {
      setPageType(editAlbum.pageType);
    }
  }, [editAlbum]);

  const actionDelay = 10;

  const handleEdit = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      router.push(`/album/edit/${editAlbum.id}`);
    }, actionDelay);
  }

  const handleExport = async () => {
    try {
      TrueSheet.dismiss(name);
      setShowGlobalLoading(true);
      // let songs = await getPlaylistSongs(editPlaylist.id);
      // await exportSongs(songs);
      setShowGlobalLoading(false);
    }
    catch (error) {
      console.log('error exporting song: ', error);
      setShowGlobalLoading(false);
    }
  }

  const executeDelete = async () => {
    try {
      await deleteAlbum(editAlbum.id);
      albumBus.emit(AlbumBusEvent.ALBUM_DELETED);
    }
    catch (error) {
      console.log('error deleting album: ', error);
    }
  }

  const handleDelete = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      Alert.alert(
        'Delete Album',
        `Are you sure you want to delete ${editAlbum.name ?? 'this album'}? (Deleting an album will not remove its songs)`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {
            if (pageType === PageType.ALBUM) {
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
        icon={require('@/src/assets/icons/edit.png')}
        text={'Edit'}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption 
        icon={require('@/src/assets/icons/share.png')}
        text={'Export'}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType) && premium && false}
        handler={handleExport}
      />
      <SheetOption
        icon={require('@/src/assets/icons/delete.png')}
        text={'Delete'}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType)}
        handler={handleDelete}
      />
    </>
  )
}

export default AlbumOptions; 