import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import SongInfo from '@/components/song/SongInfo';
import { ListCover } from '@/components/song/Cover';
import { CoverType } from '@/constants/Types';
import * as Haptics from 'expo-haptics';
import SongOptions from './SongOptions';
import Sheet from '@/components/sheet';
import SheetStyles from '@/components/sheet/Styles';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

type SongSheetProps = {
  name: string,
}

const SongSheet = ({name}: SongSheetProps) => {

  const { editSong, haptic } = useGlobalContext();
  const [scrollEnabled, setScrollEnabled] = useState(false);

  return (
    <Sheet name={name}>
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
            TrueSheet.dismiss(name);
            if (haptic) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }
        }}
      >
        <SongOptions name={name}/>
      </ScrollView>
    </Sheet>
  );
}

export default SongSheet;