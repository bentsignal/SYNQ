import React, { useState, useRef, useEffect } from 'react';
import Sheet from '@/src/components/sheet';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import ListCover from '@/src/components/cover/ListCover';
import SheetStyles from '@/src/components/sheet/Styles';
import { Styles } from '@/src/constants/Styles';
import { Colors } from '@/src/constants/Colors';
import { CoverType } from '@/src/constants/Types';
import AlbumOptions from './AlbumOptions';
import { getAlbumCover } from '@/src/controllers/AlbumController';

const AlbumSheet = ({name}: {name: string}) => {

  const { editAlbum } = useGlobalContext();

  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [emptyCover, setEmptyCover] = useState(false);
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
      if (editAlbum?.image) {
        setCoverImage(editAlbum.image);
        setEmptyCover(false);
      }
      else {
        const cover = await getAlbumCover(editAlbum.id);
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
      console.log('error loading album cover:', error);
    }
  }

  useEffect(() => {
    loadCover();
  }, [editAlbum]);

  return (
    <Sheet name={name} onChange={onChange}>
      <View style={SheetStyles.infoContainer}>
        <ListCover 
          image={coverImage}
          type={CoverType.ALBUM}
          propOnLoad={() => {}}
          empty={emptyCover}
        />
        <View style={Local.textWrapper}>
          <Text style={Local.name}>{editAlbum?.name}</Text>
          {editAlbum?.year && <Text style={Local.year}>{editAlbum.year}</Text>}
        </View>
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
        <AlbumOptions name={name}/>
      </ScrollView>
    </Sheet>
  );
}

const Local = StyleSheet.create({
  textWrapper: {
    paddingLeft: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    ...Styles.h4,
    color: Colors.text,
  },
  year: {
    ...Styles.p,
    color: Colors.infoText,
  },
});

export default AlbumSheet; 