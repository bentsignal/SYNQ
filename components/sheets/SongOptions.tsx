import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import SongInfo from '@/components/song/SongInfo';
import { ListCover } from '@/components/song/Cover';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import SongOption from './SongOption';
import { exportSongs } from '@/lib/SongManager';
import { PageType } from '@/constants/Types';
import TrackPlayer from 'react-native-track-player';
import { getTrackFromSong } from '@/lib/PlayerManager';

const SongOptions = ({show, setShow}: {show: boolean, setShow: (show: boolean) => void}) => {

  const { 
    
    editSong, theme,

    setShowEdit,
    setShowDelete, setShowOverlay, 
    setShowGlobalLoading,
  
  } = useGlobalContext();

  const actionDelay = 10;

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sheetIndex, setSheetIndex] = useState(-1);
  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editSong.pageType) {
      setPageType(editSong.pageType);
    }
  }, [editSong]);

  useEffect(() => {
    if (show) {
      bottomSheetRef.current?.expand();
      setSheetIndex(0);
    }
  }, [show]);

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={sheetIndex}
        snapPoints={['50%']}
        enablePanDownToClose={true}
        enableOverDrag={false}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.5}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
        handleIndicatorStyle={Local.handle}
        backgroundStyle={Local.background}
        style={Local.sheetStyle}
        onClose={() => {
          setShow(false);
          setSheetIndex(-1);
        }}
      >
        <BottomSheetView style={Local.bottomSheet}>
          <View style={Local.container}>
            <ListCover 
              id={editSong.id}
              image={editSong.info?.metadata?.artwork}
              propOnLoad={() => {}}
            />
            <SongInfo 
              info={editSong.info ? editSong.info : {metadata: {}}} 
              name={editSong.name ? editSong.name : ''}
            />
          </View>
          <View>
            <SongOption 
              icon={require('@/assets/icons/add.png')}
              text={'Add to Queue'}
              show={[PageType.LIBRARY, PageType.QUEUE, PageType.PLAYER].includes(pageType)}
              handler={() => {
                bottomSheetRef.current?.close();
                setTimeout(async () => {
                  const newTrack = await getTrackFromSong(editSong, theme);
                  const currentIndex = await TrackPlayer.getActiveTrackIndex();
                  if (newTrack) {
                    if (currentIndex !== undefined) {
                      await TrackPlayer.add(newTrack, currentIndex+1);
                    }
                    // TODO: Figure out how to queue songs when no song is playing
                    // else {
                    //   await TrackPlayer.add(newTrack);
                    // }
                  }
                }, actionDelay);
              }}
            />
            <SongOption 
              icon={require('@/assets/icons/edit.png')}
              text={'Edit'}
              show={[PageType.LIBRARY, PageType.IMPORT].includes(pageType)}
              handler={() => {
                bottomSheetRef.current?.close();
                setTimeout(() => {
                  setShowOverlay(true);
                  setShowEdit(true);
                }, actionDelay);
              }}
            />
            <SongOption 
              icon={require('@/assets/icons/share.png')}
              text={'Export'}
              show={[PageType.LIBRARY, PageType.IMPORT].includes(pageType)}
              handler={async () => {
                try {
                  setShowGlobalLoading(true);
                  await exportSongs([editSong]);
                  setShowGlobalLoading(false);
                }
                catch (error) {
                  console.log('error exporting song: ', error);
                  setShowGlobalLoading(false);
                }
              }}
            />
            <SongOption
              icon={require('@/assets/icons/delete.png')}
              text={'Delete'}
              show={[PageType.LIBRARY, PageType.IMPORT].includes(pageType)}
              handler={() => {
                bottomSheetRef.current?.close();
                setTimeout(() => {
                  setShowOverlay(true);
                  setShowDelete(true);
                }, actionDelay);
              }}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
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