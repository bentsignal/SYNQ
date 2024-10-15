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

const SongOptions = () => {

  const { 
    
    showSongOptions, editSong, 

    setShowSongOptions, setShowEdit,
    setShowDelete, setShowOverlay, 
    setShowGlobalLoading,

    addToQueue,
  
  } = useGlobalContext();

  const actionDelay = 10;

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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sheetIndex, setSheetIndex] = useState(-1);

  useEffect(() => {
    if (showSongOptions) {
      bottomSheetRef.current?.expand();
      setSheetIndex(0);
    }
  }, [showSongOptions]);

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
          setShowSongOptions(false);
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
              handler={() => {
                bottomSheetRef.current?.close();
                setTimeout(() => {
                  addToQueue(editSong.id);
                }, actionDelay);
              }}
            />
            <SongOption 
              icon={require('@/assets/icons/edit.png')}
              text={'Edit'}
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
              handler={async () => {
                try {
                  setShowGlobalLoading(true);
                  await exportSongs([editSong]);
                  setShowGlobalLoading(false);
                }
                catch (error) {
                  setShowGlobalLoading(false);
                }
              }}
            />
            <SongOption
              icon={require('@/assets/icons/delete.png')}
              text={'Delete'}
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

export default SongOptions;