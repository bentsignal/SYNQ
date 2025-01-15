import React, { useState, useRef } from 'react';
import Sheet from '@/src/components/sheet';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import ListCover from '@/src/components/cover/ListCover';
import SheetStyles from '@/src/components/sheet/Styles';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { CoverType } from '@/constants/Types';
import AlbumOptions from './AlbumOptions';

const AlbumSheet = ({name}: {name: string}) => {

  const { editAlbum } = useGlobalContext();

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
          id={editAlbum?.id}
          type={CoverType.ALBUM}
          propOnLoad={() => {}}
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