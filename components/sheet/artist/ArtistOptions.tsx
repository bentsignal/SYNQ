import SheetOption from '@/components/sheet/SheetOption';
import { PageType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import { useEffect, useState } from 'react';
import { exportSongs } from '@/lib/controllers/SongController';
import { useThemeContext } from '@/context/ThemeProvider';
import { usePremiumContext } from '@/context/PremiumProvider';
import { deletePlaylist, getPlaylistSongs } from '@/lib/controllers/PlaylistController';
import { getSongByResult } from '@/lib/controllers/SongController';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { PlaylistBusEvent } from '@/station/playlist/Events';
import playlistBus from '@/station/playlist';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ArtistBusEvent } from '@/station/artist/Events';
import artistBus from '@/station/artist';
import { deleteArtist } from '@/lib/controllers/ArtistController';


const ArtistOptions = ({name}: {name: string}) => {

  const { editArtist, setShowGlobalLoading } = useGlobalContext();

  const { premium } = usePremiumContext();
  
  const { theme } = useThemeContext();

  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editArtist.pageType) {
      setPageType(editArtist.pageType);
    }
  }, [editArtist]);

  const actionDelay = 10;

  const handleEdit = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      router.push(`/artist/edit/${editArtist.id}`);
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
      await deleteArtist(editArtist.id);
      artistBus.emit(ArtistBusEvent.ARTIST_DELETED);
    }
    catch (error) {
      console.log('error deleting artist: ', error);
    }
  }

  const handleDelete = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      Alert.alert(
        'Delete Artist',
        `Are you sure you want to delete ${editArtist.name ?? 'this artist'}? (Deleting an artist will not remove their songs & albums)`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {
            if (pageType === PageType.ARTIST) {
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
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption 
        icon={require('@/assets/icons/share.png')}
        text={'Export'}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType) && premium}
        handler={handleExport}
      />
      <SheetOption
        icon={require('@/assets/icons/delete.png')}
        text={'Delete'}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType)}
        handler={handleDelete}
      />
    </>
  )
}

export default ArtistOptions;