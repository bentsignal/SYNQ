import React, { useState, useRef, useEffect } from 'react';
import Sheet from '@/src/components/sheet';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import ListCover from '@/src/components/cover/ListCover';
import SheetStyles from '@/src/components/sheet/Styles';
import { Styles } from '@/src/constants/Styles';
import { Colors } from '@/src/constants/Colors';
import { CoverType } from '@/src/constants/Types';
import ArtistOptions from '@/src/components/sheet/artist/ArtistOptions';
import { getArtistCover } from '@/src/controllers/ArtistController';

const ArtistSheet = ({name}: {name: string}) => {

  const { editArtist } = useGlobalContext();

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
      if (editArtist?.image) {
        setCoverImage(editArtist.image);
        setEmptyCover(false);
      }
      else {
        const cover = await getArtistCover(editArtist.id);
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
      console.log('error loading artist cover:', error);
    } 
  }

  useEffect(() => {
    loadCover();
  }, [editArtist]);

  return (
    <Sheet name={name} onChange={onChange}>
      <View style={SheetStyles.infoContainer}>
        <ListCover 
          image={coverImage}
          type={CoverType.ARTIST}
          propOnLoad={() => {}}
          empty={emptyCover}
        />
        <View style={Local.textWrapper}>
          <Text style={Local.name}>{editArtist?.name}</Text>
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
        <ArtistOptions name={name}/>
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
  count: {
    ...Styles.p,
    color: Colors.infoText,
  },
});

export default ArtistSheet;