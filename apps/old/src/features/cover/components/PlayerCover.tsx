import { View, StyleSheet, Text, Image, useWindowDimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Colors } from '@/src/constants/Colors';
import Ad from '@/src/features/premium/components/Ad';
import { useThemeContext } from '@/src/features/theme/context/ThemeProvider';
import { usePlaybackAdContext } from '@/src/features/playback/context/PlaybackAdProvider';

const PlayerCover = ({uri}: {uri: string}) => {

  const { adPlaying } = usePlaybackAdContext();
  const { theme } = useThemeContext();
  const { width } = useWindowDimensions();
  const coverSize = width * COVER_SIZE_RATIO;
  const containerStyle = [
    Local.container,
    {
      width: coverSize,
      height: coverSize,
    },
  ];

  if (adPlaying) {
    return (
      <View style={containerStyle}>
        <View style={Local.adContainer}>
          <Ad message={
            <Text>
              Listen to your music ad-free with 
              <Text style={{color: theme}}>
                {' '}Premium
              </Text>
            </Text>
          }/>
        </View>
      </View>
    );
  }
  else if (uri && typeof uri === 'string' && uri !== 'transparent') {
    return (
      <View style={containerStyle}>
        <Image
          source={{uri: uri}}
          resizeMode='cover'
          style={Local.artwork}
        />
      </View>
    );
  }
  else {
    return (
      <View style={[...containerStyle, Local.emptyContainer]}>
        <FastImage
          source={require('@/src/assets/icons/music.png')}
          style={Local.empty}
        />
      </View>
    );
  }

}

const COVER_SIZE_RATIO = 0.85;

const Local = StyleSheet.create({
  container: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 8,
  },
  emptyContainer: {
    backgroundColor: '#D2D2D2',
  },
  artwork: {
    aspectRatio: 1,
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  empty: {
    width: 100,
    height: 100,
  },
  adContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  }
});

export default PlayerCover
