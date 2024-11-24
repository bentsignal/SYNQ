import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import SongInfo from '@/components/song/SongInfo';
import { ListCover } from '@/components/song/Cover';
import BottomSheet from '@gorhom/bottom-sheet';
import { CoverType } from '@/constants/Types';
import * as Haptics from 'expo-haptics';
import SongOptions from './SongOptions';
import Sheet from '@/components/sheets/Sheet';

type SongSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet>,
  setIsOpen: (isOpen: boolean) => void
}

const SongSheet = ({bottomSheetRef, setIsOpen}: SongSheetProps) => {

  const { editSong, haptic } = useGlobalContext();
  const [scrollEnabled, setScrollEnabled] = useState(false);

  return (
    <Sheet
      bottomSheetRef={bottomSheetRef}
      setIsOpen={setIsOpen}
      setScrollEnabled={setScrollEnabled}
      children={
        <>
          <View style={Local.infoContainer}>
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
            <SongOptions bottomSheetRef={bottomSheetRef} />
          </ScrollView>
        </>
      }
    />
  );
}

const Local = StyleSheet.create({
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#222222',
    borderBottomWidth: 1,
  }
});

export default SongSheet;