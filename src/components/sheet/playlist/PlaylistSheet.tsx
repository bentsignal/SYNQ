import React, { useState, useRef, useEffect } from 'react';
import Sheet from '@/src/components/sheet';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import ListCover from '@/src/components/cover/ListCover';
import SheetStyles from '@/src/components/sheet/Styles';
import { Styles } from '@/src/constants/Styles';
import { Colors } from '@/src/constants/Colors';
import { CoverType } from '@/src/constants/Types';
import PlaylistOptions from '@/src/components/sheet/playlist/PlaylistOptions';
import { getPlaylistCover } from '@/src/controllers/PlaylistController';

const PlaylistSheet = ({name}: {name: string}) => {

  const { editPlaylist } = useGlobalContext();

  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  
  const loadCover = async () => {
    try {
      const cover = await getPlaylistCover(editPlaylist.id);
      if (cover) {
        setCoverImage(cover);
      }
      else {
        setCoverImage('');
      }
    }
    catch (error) {
      console.log('error loading playlist cover:', error);
    }
  }

  const onChange = (index: number) => {
    if (index === 0) {
      setScrollEnabled(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
    else if (index === 1) {
      setScrollEnabled(true);
    }
  }

  useEffect(() => {
    loadCover();
  }, [editPlaylist.id]);

  return (
    <Sheet name={name} onChange={onChange}>
      <View style={SheetStyles.infoContainer}>
        <ListCover 
          id={editPlaylist?.id.toString()}
          image={coverImage}
          type={CoverType.PLAYLIST}
          propOnLoad={() => {}}
        />
        <View style={Local.textWrapper}>
          <Text style={Local.name}>{editPlaylist?.name}</Text>
          <Text style={Local.count}>{editPlaylist?.songCount} {editPlaylist?.songCount === 1 ? 'song' : 'songs'}</Text>
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
        <PlaylistOptions name={name}/>
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

export default PlaylistSheet;