import { View, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { PageType } from '@/src/constants/Types';

type SongListPageCoverProps = {
  id: number;
  type: PageType;
  image?: string;
};

const SongListPageCover = ({id, type, image}: SongListPageCoverProps) => {

  const coverPercent = 0.65;

  const Local = StyleSheet.create({
    container: {
      backgroundColor: image ? 'transparent' : '#D2D2D2',
      width: Dimensions.get('screen').width * coverPercent, 
      minHeight: Dimensions.get('screen').width * coverPercent,
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: type === PageType.ARTIST ? 1000 : 12,
    },
    artwork: {
      aspectRatio: 1,
      width: image ? Dimensions.get('screen').width * coverPercent : 60,
      borderRadius: type === PageType.ARTIST ? 1000 : 12,
    },
  });

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
    <View style={Local.container}>
      <FastImage
        source={getSource()}
        style={Local.artwork}
      />
    </View>
  );

}

export default SongListPageCover;
