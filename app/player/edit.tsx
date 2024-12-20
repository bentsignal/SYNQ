import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import SongInfo from '@/components/song/SongInfo';
import ListCover from '@/components/cover/ListCover';
import { CoverType } from '@/constants/Types';
import * as Haptics from 'expo-haptics';
import Sheet from '@/components/sheet';
import SheetStyles from '@/components/sheet/Styles';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import SongOptions from '@/components/sheet/song/SongOptions';
import Bar from '@/components/modals/Bar';

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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingLeft: 20,
    paddingRight: 20,
  }
});

export default PlayerSongEdit;