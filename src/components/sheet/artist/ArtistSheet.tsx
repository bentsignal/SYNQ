import React, { useState, useRef } from 'react';
import Sheet from '@/src/components/sheet';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import ListCover from '@/src/components/cover/ListCover';
import SheetStyles from '@/src/components/sheet/Styles';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { CoverType } from '@/constants/Types';
import ArtistOptions from '@/src/components/sheet/artist/ArtistOptions';

const ArtistSheet = ({name}: {name: string}) => {

  const { editArtist } = useGlobalContext();

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
          id={editArtist?.id}
          type={CoverType.ARTIST}
          propOnLoad={() => {}}
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