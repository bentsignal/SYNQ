import React, { useState, useRef, useEffect } from 'react';
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
import { getAbsoluteSongCover } from '@/src/controllers/SongController';

type SongSheetProps = {
  name: string,
}

export default function ImportSongSheet({name}: SongSheetProps) {

  const { editSong, haptic } = useGlobalContext();
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [emptyCover, setEmptyCover] = useState(false);
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

  const loadCover = async () => {
    try {
      if (editSong.artwork) {
        setCoverImage(editSong.artwork);
        setEmptyCover(false);
      }
      else {
        const cover = await getAbsoluteSongCover(editSong.id);
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
  }, [editSong]);

  return (
    <Sheet name={name} onChange={onChange}>
      <View style={SheetStyles.infoContainer}>
        <ListCover 
          type={CoverType.SONG}
          image={coverImage}
          propOnLoad={() => {}}
          empty={emptyCover}
        />
        <SongInfo 
          fileName={editSong.fileName}
          title={editSong.title}
          artist={editSong.artist}
          album={editSong.album}
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