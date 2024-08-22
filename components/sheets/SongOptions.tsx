import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
      setSheetIndex(1);
    }
    else {
      bottomSheetRef.current?.close();
      setSheetIndex(-1);
    }
  }, [showSongOptions]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={sheetIndex}
      snapPoints={['100%', '50%']}
      enablePanDownToClose={true}
      enableOverDrag={true}
      style={{
        zIndex: 100,
        backgroundColor: 'red',
      }}
      onClose={() => {
        setSheetIndex(-1);
        setShowSongOptions(false);
      }}
      onChange={(index) => {
        setSheetIndex(index);
        console.log('here');
      }}
    >
      <BottomSheetView 
        style={{
          backgroundColor: Colors.popup,
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          flex: 1,
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
  );
}

export default SongOptions;