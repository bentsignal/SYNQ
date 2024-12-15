import React, { useState } from 'react';
import Sheet from '@/components/sheet';
import { useGlobalContext } from '@/context/GlobalProvider';
import { View, Text, StyleSheet } from 'react-native';
import { ListCover } from '@/components/song/Cover';
import SheetStyles from '@/components/sheet/Styles';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { CoverType } from '@/constants/Types';
import PlaylistOptions from '@/components/sheet/playlist/PlaylistOptions';

const PlaylistSheet = ({name}: {name: string}) => {

  const { editPlaylist } = useGlobalContext();

  return (
    <Sheet name={name}>
      <View style={SheetStyles.infoContainer}>
        <ListCover 
          id={editPlaylist?.id}
          type={CoverType.PLAYLIST}
          propOnLoad={() => {}}
        />
        <View style={Local.textWrapper}>
          <Text style={Local.name}>{editPlaylist?.name}</Text>
          <Text style={Local.count}>{editPlaylist?.songCount} {editPlaylist?.songCount === 1 ? 'song' : 'songs'}</Text>
        </View>
      </View> 
      <PlaylistOptions name={name}/>
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