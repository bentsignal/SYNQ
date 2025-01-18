import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { Colors } from '@/src/constants/Colors';
import SongInfo from '@/src/components/song/SongInfo';
import ListCover from '@/src/components/cover/ListCover';
import { CoverType } from '@/src/constants/Types';
import * as Haptics from 'expo-haptics';
import Sheet from '@/src/components/sheet';
import SheetStyles from '@/src/components/sheet/Styles';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import SongOptions from '@/src/components/sheet/song/SongOptions';
import Bar from '@/src/components/modals/Bar';
import ModalStyles from '@/src/components/modals/Styles';
import { getAbsoluteSongCover } from '@/src/controllers/SongController';

const PlayerSongEdit = () => {

  const name = 'player-song-sheet';
  
  const { editSong, haptic } = useGlobalContext();

  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [emptyCover, setEmptyCover] = useState(false);

  const loadCover = async () => { 
    try {
      if (editSong.id) {
        const cover = await getAbsoluteSongCover(Number(editSong.id));
        if (cover) {
          setCoverImage(cover);
          setEmptyCover(false);
        }
        else {
          setCoverImage('');
          setEmptyCover(true);
        }
      }
    }
    catch (error) {
      console.log('error loading song cover:', error);
    }
  }

  useEffect(() => {
    loadCover();
  }, [editSong.id]);

  return (
    <View style={local.container}>
      <Bar />
      <View style={SheetStyles.infoContainer}>
        <ListCover 
          image={coverImage}
          type={CoverType.SONG}
          propOnLoad={() => {}}
          empty={emptyCover}
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