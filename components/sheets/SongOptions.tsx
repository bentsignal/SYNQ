import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import SongInfo from '@/components/song/SongInfo';
import { ListCover } from '@/components/song/Cover';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import SongOption from './SongOption';
import { exportSongs } from '@/lib/SongManager';
import { CoverType, PageType } from '@/constants/Types';
import { getTrackFromSong, addToQueue } from '@/lib/PlayerManager';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

type SongOptionsProps = {
  bottomSheetRef: React.RefObject<BottomSheet>,
  setIsOpen: (isOpen: boolean) => void
}

const SongOptions = ({bottomSheetRef, setIsOpen}: SongOptionsProps) => {

  const { 
    
    editSong, theme,
    numModified, premium,
    haptic,

    setShowEdit, setShowImportAd,
    setShowDelete, setShowOverlay, 
    setShowGlobalLoading,
    setNumModified,
  
  } = useGlobalContext();

  const actionDelay = 10;

  const [sheetIndex, setSheetIndex] = useState(-1);
  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  useEffect(() => {
    if (editSong.pageType) {
      setPageType(editSong.pageType);
    }
  }, [editSong]);

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

  const handleSheetChanges = useCallback((index: number) => {
    setSheetIndex(index);
    setIsOpen(index !== -1);
    setScrollEnabled(index === 1);
  }, []);

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={sheetIndex}
        snapPoints={['45%', '80%']}
        enablePanDownToClose={true}
        enableOverDrag={true}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.7}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
        handleIndicatorStyle={Local.handle}
        backgroundStyle={Local.background}
        style={Local.sheetStyle}
        onChange={handleSheetChanges}
        onClose={() => {
          setSheetIndex(-1);
        }}
        children={
          <BottomSheetView 
            style={Local.bottomSheet}
            children={
              <>
                <View style={Local.container}>
                  <ListCover 
                    id={editSong.id}
                    type={CoverType.SONG}
                    image={editSong.info?.metadata?.artwork}
                    propOnLoad={() => {}}
                  />
                  <SongInfo 
                    info={editSong.info ? editSong.info : {metadata: {}}} 
                    name={editSong.name ? editSong.name : ''}
                  />
                </View>
                <ScrollView
                  scrollEnabled={scrollEnabled}
                  onMomentumScrollBegin={(event) => {
                    if (event.nativeEvent.contentOffset.y < 0) {
                      bottomSheetRef.current?.close();
                      if (haptic) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                    }
                  }}
                >
                  <SongOption 
                    icon={require('@/assets/icons/add.png')}
                    text={'Add to Playlist'}
                    show={[PageType.LIBRARY, PageType.PLAYER].includes(pageType)}
                    handler={handleAddToPlaylist}
                  />
                  <SongOption 
                    icon={require('@/assets/icons/add-to-queue.png')}
                    text={'Add to Queue'}
                    show={[PageType.LIBRARY, PageType.QUEUE, PageType.PLAYER].includes(pageType)}
                    handler={handleAddToQueue}
                  />
                  <SongOption 
                    icon={require('@/assets/icons/edit.png')}
                    text={'Edit'}
                    show={[PageType.LIBRARY, PageType.IMPORT].includes(pageType)}
                    handler={handleEditSong}
                  />
                  <SongOption 
                    icon={require('@/assets/icons/share.png')}
                    text={'Export'}
                    show={[PageType.LIBRARY].includes(pageType)}
                    handler={handleExport}
                  />
                  <SongOption
                    icon={require('@/assets/icons/delete.png')}
                    text={'Delete'}
                    show={[PageType.LIBRARY, PageType.IMPORT].includes(pageType)}
                    handler={handleDeleteSong}
                  />
                </ScrollView>
              </>
            }
          />
        }
      />
    </>
  );
}

const Local = StyleSheet.create({
  handle: {
    backgroundColor: Colors.altDisabled,
    width: 80,
    marginTop: 5,
  },
  background: {
    backgroundColor: Colors.popup,
  },
  sheetStyle: {
    flexGrow: 1,
  },
  bottomSheet: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: Colors.popup,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    flexGrow: 1,
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#222222',
    borderBottomWidth: 1,
  }
});

export default SongOptions;