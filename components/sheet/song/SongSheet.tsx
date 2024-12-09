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
import Sheet from '@/components/sheet';
import SheetStyles from '@/components/sheet/Styles';

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
    >
      <View style={SheetStyles.infoContainer}>
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
    </Sheet>
  );
}

export default SongSheet;