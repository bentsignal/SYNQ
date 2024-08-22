import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import SongInfo from '@/components/song/SongInfo';
import { ListCover } from '@/components/song/Cover';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';

const SongOptions = () => {

  const { 
    
    showSongOptions, editSong, 

    setShowSongOptions, setShowEdit,
    setShowDelete, setDeleteSong,
  
  } = useGlobalContext();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const [sheetIndex, setSheetIndex] = useState(-1);

  useEffect(() => {
    if (showSongOptions) {
      bottomSheetRef.current?.expand();
      setSheetIndex(0);
    }
    else {
      bottomSheetRef.current?.close();
      setSheetIndex(-1);
    }
  }, [showSongOptions]);

  return (
    <>
      <TouchableOpacity 
        style={{
          width: '100%',
          flexGrow: 1,
        }}
        onPress={() => {
          bottomSheetRef.current?.close();
        }}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={sheetIndex}
        snapPoints={['50%']}
        enablePanDownToClose={true}
        enableOverDrag={false}
        handleIndicatorStyle={{
          backgroundColor: Colors.altDisabled,
          width: 80,
          marginTop: 5,
        }}
        backgroundStyle={{
          backgroundColor: Colors.popup,
        }}
        onClose={() => {
          setSheetIndex(-1);
          setShowSongOptions(false);
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
            <TouchableOpacity
              style={Styles.songOptionActionContainer}
              activeOpacity={0.9}
              onPress={() => {
                bottomSheetRef.current?.close();
                setTimeout(() => {
                  setShowEdit(true);
                }, 100);
              }}
            >
              <Image 
                source={require('@/assets/icons/edit.png')}
                style={Styles.songOptionIcon}
              />
              <Text style={Styles.songOptionActionText}>
                Edit song
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={Styles.songOptionActionContainer}
              activeOpacity={0.9}
              onPress={() => {
                bottomSheetRef.current?.close();
                setTimeout(() => {
                  setShowDelete(true);
                  setDeleteSong({name: editSong.name, id: editSong.id});
                }, 100);
              }}
            >
              <Image 
                source={require('@/assets/icons/delete.png')}
                style={Styles.songOptionIcon}
              />
              <Text style={Styles.songOptionActionText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

export default SongOptions;