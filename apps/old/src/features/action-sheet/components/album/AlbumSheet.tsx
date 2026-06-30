import React, { useState, useRef } from 'react';
import Sheet from '@/src/features/action-sheet/components';
import { useActionSheetContext } from '@/src/features/action-sheet/context/ActionSheetProvider';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import ListCover from '@/src/features/cover/components/ListCover';
import SheetStyles from '@/src/features/action-sheet/components/Styles';
import { Styles } from '@/src/constants/Styles';
import { Colors } from '@/src/constants/Colors';
import { CoverType } from '@/src/constants/Types';
import AlbumOptions from './AlbumOptions';

const AlbumSheet = ({name}: {name: string}) => {

  const { editAlbum } = useActionSheetContext();

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
          image={editAlbum?.image}
          type={CoverType.ALBUM}
          propOnLoad={() => {}}
          empty={!editAlbum?.image}
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
