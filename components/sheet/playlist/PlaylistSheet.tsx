import React, { useState } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import Sheet from '@/components/sheet';
import { useGlobalContext } from '@/context/GlobalProvider';
import { View, Text, StyleSheet } from 'react-native';
import { ListCover } from '@/components/song/Cover';
import SheetStyles from '@/components/sheet/Styles';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { CoverType } from '@/constants/Types';
import PlaylistOptions from '@/components/sheet/playlist/PlaylistOptions';

type PlaylistSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet>,
  setIsOpen: (isOpen: boolean) => void
}

const PlaylistSheet = ({bottomSheetRef, setIsOpen}: PlaylistSheetProps) => {
  const { editPlaylist } = useGlobalContext();
  const [scrollEnabled, setScrollEnabled] = useState(false);
  return (
    <Sheet
      bottomSheetRef={bottomSheetRef}
      setIsOpen={setIsOpen}
      setScrollEnabled={setScrollEnabled}
    >
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
      <PlaylistOptions bottomSheetRef={bottomSheetRef} />
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