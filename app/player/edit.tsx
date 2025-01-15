import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import SongInfo from '@/src/components/song/SongInfo';
import ListCover from '@/src/components/cover/ListCover';
import { CoverType } from '@/constants/Types';
import * as Haptics from 'expo-haptics';
import Sheet from '@/src/components/sheet';
import SheetStyles from '@/src/components/sheet/Styles';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import SongOptions from '@/src/components/sheet/song/SongOptions';
import Bar from '@/src/components/modals/Bar';
import ModalStyles from '@/src/components/modals/Styles';

const PlayerSongEdit = () => {
  const name = 'player-song-sheet';
  const { editSong, haptic } = useGlobalContext();
  const [scrollEnabled, setScrollEnabled] = useState(false);

  return (
    <View style={local.container}>
      <Bar />
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
    </View>
  );
}

const local = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
    paddingLeft: 20,
    paddingRight: 20,
  }
});

export default PlayerSongEdit;