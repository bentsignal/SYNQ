import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { Colors } from '@/src/constants/Colors';
import SongInfo from '@/src/components/song/SongInfo';
import ListCover from '@/src/components/cover/ListCover';
import { CoverType } from '@/src/constants/Types';
import * as Haptics from 'expo-haptics';
import SongOptions from './SongOptions';
import Sheet from '@/src/components/sheet';
import SheetStyles from '@/src/components/sheet/Styles';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

type SongSheetProps = {
  name: string,
}

const SongSheet = ({name}: SongSheetProps) => {

  const { editSong, haptic } = useGlobalContext();
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const onChange = (index: number) => {
    if (index === 0) {
      setScrollEnabled(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
    else if (index === 1) {
      setScrollEnabled(true);
    }
  }

  return (
    <Sheet name={name} onChange={onChange}>
      <View style={SheetStyles.infoContainer}>
        <ListCover 
          id={editSong.id}
          key={editSong.id}
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
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        style={{
          height: Dimensions.get('window').height
        }}
        contentContainerStyle={{
          paddingBottom: 300,
        }}
      >
        <SongOptions name={name}/>
      </ScrollView>
    </Sheet>
  );
}

export default SongSheet;