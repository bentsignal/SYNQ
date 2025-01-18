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
      width: 25,
    },
    topContainer: {
      flexDirection: 'row',
      overflow: 'hidden',
    }
  });

  const getSource = () => {
    if (theme === Themes.blue) {
      return {uri: 'https://lottie.host/41c6ba69-eb13-484f-83d0-9699b8dc4cbd/Sfz7JH8UQc.lottie'};
    }
    else if (theme === Themes.purple) {
      return {uri: 'https://lottie.host/d72eaf7d-35d2-47d9-9c65-e7315478559e/LeUbC55Sqi.lottie'};
    }
    else if (theme === Themes.pink) {
      return {uri: 'https://lottie.host/e5d98bc7-a978-4197-a4f2-bb4432798076/KkEI1a7Hv2.lottie'};
    }
    else if (theme === Themes.red) {
      return {uri: 'https://lottie.host/077a4f29-5780-4fe3-adac-f724eeba3644/ZZUzvPoADA.lottie'};
    }
    else if (theme === Themes.orange) {
      return {uri: 'https://lottie.host/00a38c62-5597-46be-92fb-5dac1ae0d974/4FpHrCoQ6O.lottie'};
    }
    else if (theme === Themes.yellow) {
      return {uri: 'https://lottie.host/de48b9f6-d57b-47cd-89f8-b7e89aa8e26e/fgkW8XWwmF.lottie'};
    }
    else if (theme === Themes.mint) {
      return {uri: 'https://lottie.host/77ca529a-fa32-41f9-8d7a-1d82d0d8408b/aiJPLtBtga.lottie'};
    }
    else {
      return {uri: 'https://lottie.host/41c6ba69-eb13-484f-83d0-9699b8dc4cbd/Sfz7JH8UQc.lottie'};
    }
  }

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
            source={getSource()}
            autoPlay
            loop={true}
            style={Local.sound}
            renderMode={'HARDWARE'}
            colorFilters={[{ keypath: 'Shape Layer 1', color: theme }]}
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