import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

type SheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet>,
  setIsOpen: (isOpen: boolean) => void,
  setScrollEnabled: (scrollEnabled: boolean) => void,
  children: React.ReactNode,
}

const Sheet = ({bottomSheetRef, setIsOpen, setScrollEnabled, children}: SheetProps) => {

  const [sheetIndex, setSheetIndex] = useState(-1);

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
            children={children}
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
});

export default Sheet;