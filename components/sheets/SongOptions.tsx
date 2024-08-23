import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import SongInfo from '@/components/song/SongInfo';
import { ListCover } from '@/components/song/Cover';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import SongOption from './SongOption';

const SongOptions = () => {

  const { 
    
    showSongOptions, editSong, 

    setShowSongOptions, setShowEdit,
    setShowDelete, setDeleteSong,
    setShowOverlay,
  
  } = useGlobalContext();

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
        handleIndicatorStyle={{
          backgroundColor: Colors.altDisabled,
          width: 80,
          marginTop: 5,
        }}
        backgroundStyle={{
          backgroundColor: Colors.popup,
        }}
        style={{
          flexGrow: 1,
        }}
        onClose={() => {
          setShowSongOptions(false);
          setSheetIndex(-1);
        }}
      >
        <BottomSheetView 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: Colors.popup,
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            flex: 1,
            flexGrow: 1,
            zIndex: 100,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 20,
              paddingBottom: 20,
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomColor: '#222222',
              borderBottomWidth: 1,
            }}
          >
            <ListCover 
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
              icon={require('@/assets/icons/edit.png')}
              text={'Edit'}
              handler={() => {
                bottomSheetRef.current?.close();
                setTimeout(() => {
                  setShowOverlay(true);
                  setShowEdit(true);
                }, 100);
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
                  setDeleteSong({name: editSong.name, id: editSong.id});
                }, 100);
              }}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

export default SongOptions;