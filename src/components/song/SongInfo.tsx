import { Text, View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useEffect, useState } from 'react';
import { Colors, Themes } from '@/src/constants/Colors';
import { InfoType } from '@/src/constants/Types';
import { Styles } from '@/src/constants/Styles';
import { useActiveTrack } from 'react-native-track-player';
import { useThemeContext } from '@/src/context/ThemeProvider';
import LottieView from 'lottie-react-native';
import { replaceColor } from 'lottie-colorify';
import { darkenColor } from '@/src/controllers/ColorController';

const SongInfo = ({info, name, id, showAlbum, color, titleStyles, artistStyles}: {
  info: InfoType, 
  name: string,
  id?: string,
  showAlbum?: boolean,
  color?: string,
  titleStyles?: StyleProp<TextStyle>,
  artistStyles?: StyleProp<TextStyle>,
}) => {

  const activeTrack = useActiveTrack();
  const [isActive, setIsActive] = useState(false);
  const { theme } = useThemeContext();

  useEffect(() => {
    if (activeTrack?.id &&activeTrack?.id === id) {
      setIsActive(true);
    }
    else if (isActive) {
      setIsActive(false);
    }
  }, [activeTrack]);

  const Local = StyleSheet.create({
    infoContainer: {
      flex: 1,
      paddingLeft: 10,
      flexGrow: 1,
      justifyContent: 'center'
    },
    title: {
      ...Styles.h5,
      color: color ? color : isActive ? theme : Colors.text,
    },
    artistAlbum: {
      ...Styles.sub,
      color: color ? color : Colors.infoText,
      fontWeight: '500',
    },
    sound: {
      width: 20,
    },
    topContainer: {
      flexDirection: 'row',
      maxWidth: '90%',
    }
  });

  return (
    <View style={ Local.infoContainer }>
      <View style={Local.topContainer}>
        <Text
          style={ titleStyles ? titleStyles : Local.title }
          numberOfLines={1}
        >
          {info.metadata?.name ? info.metadata.name.trimEnd() : name.trimEnd()}
        </Text>
        { isActive &&
          <LottieView 
            source={replaceColor(Themes.blue, theme, require('@/src/assets/anim/sound.json'))}
            autoPlay
            loop={true}
            style={Local.sound}
            renderMode={'SOFTWARE'}
          />
        }
      </View>
      <Text
        style={[artistStyles ? artistStyles : Local.artistAlbum, {
          display: info.metadata?.artist ? 'flex' : 'none'
        }]}
        numberOfLines={1}
      >
        {info.metadata?.artist} {showAlbum && info.metadata.album ? `· ${info.metadata.album}` : ''}
      </Text>
    </View>
  );

}

export default SongInfo;