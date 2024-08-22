import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';

const SongOptions = () => {

  const { 
    
    showSongOptions,

    setShowSongOptions,
  
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
          <Text style={{
            color: Colors.text,
            fontSize: 20,
            fontWeight: 'bold',
          }}>
            Hello
          </Text>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

export default SongOptions;