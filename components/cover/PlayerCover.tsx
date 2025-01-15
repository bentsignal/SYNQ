import { View, StyleSheet, Dimensions, Text, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import Ad from '@/components/Ad';
import { useThemeContext } from '@/src/context/ThemeProvider';

const PlayerCover = ({uri}: {uri: string}) => {

  const { adPlaying } = useGlobalContext();
  const { theme } = useThemeContext();

  if (adPlaying) {
    return (
      <View style={Local.container}>
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
      <View style={Local.container}>
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
      <View style={[Local.container, Local.emptyContainer]}>
        <FastImage
          source={require('@/src/assets/icons/music.png')}
          style={Local.empty}
        />
      </View>
    );
  }

}

const Local = StyleSheet.create({
  container: {
    width: Dimensions.get('screen').width * 0.85,
    height: Dimensions.get('screen').width * 0.85,
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
