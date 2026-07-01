import { View, StyleSheet, useWindowDimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { PageType } from '@/src/constants/Types';

type SongListPageCoverProps = {
  id: number;
  type: PageType;
  image?: string;
};

const SongListPageCover = ({id, type, image}: SongListPageCoverProps) => {
  const { width } = useWindowDimensions();
  const coverSize = width * COVER_SIZE_RATIO;
  const borderRadius = type === PageType.ARTIST ? 1000 : 12;

  const getSource = () => {
    if (image) {
      return {uri: `${image}`};
    }
    else if (type === PageType.PLAYLIST && id === 2) {
      return require('@/src/assets/icons/heart.png');
    }
    else if (type === PageType.PLAYLIST) {
      return require('@/src/assets/icons/cassette-tape.png');
    }
    else if (type === PageType.ALBUM) {
      return require('@/src/assets/icons/cd-drive.png');
    }
    else if (type === PageType.ARTIST) {
      return require('@/src/assets/icons/user.png');
    }
    else {
      return require('@/src/assets/icons/music.png');
    }
  }

  return (
    <View
      style={[
        Local.container,
        {
          backgroundColor: image ? 'transparent' : '#D2D2D2',
          borderRadius,
          width: coverSize,
          minHeight: coverSize,
        },
      ]}
    >
      <FastImage
        source={getSource()}
        style={[
          Local.artwork,
          {
            borderRadius,
            width: image ? coverSize : 60,
          },
        ]}
      />
    </View>
  );

}

const COVER_SIZE_RATIO = 0.65;

const Local = StyleSheet.create({
  container: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artwork: {
    aspectRatio: 1,
  },
});

export default SongListPageCover;
