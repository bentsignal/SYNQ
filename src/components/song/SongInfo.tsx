import { Text, View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { memo } from 'react';
import { Colors, Themes } from '@/src/constants/Colors';
import { Styles } from '@/src/constants/Styles';
import { useThemeContext } from '@/src/context/ThemeProvider';
import LottieView from 'lottie-react-native';
import { replaceColor } from 'lottie-colorify';

const SongInfo = memo(({
  id, 
  fileName,
  title,
  artist,
  album,
  showAlbum, 
  color, titleStyles, 
  artistStyles, 
  isActive
}: {
  id?: string,
  fileName?: string,
  title?: string,
  artist?: string,
  album?: string,
  showAlbum?: boolean,
  color?: string,
  titleStyles?: StyleProp<TextStyle>,
  artistStyles?: StyleProp<TextStyle>,
  isActive?: boolean,
}) => {

  const { theme } = useThemeContext();

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
          {title ? title.trimEnd() : fileName?.trimEnd()}
        </Text>
        { isActive &&
          <LottieView 
            source={replaceColor(Themes.blue, theme, require('@/src/assets/anim/sound.json'))}
            autoPlay
            loop={true}
            style={{width: 20}}
            renderMode={'SOFTWARE'}
          />
        }
      </View>
      <Text
        style={[artistStyles ? artistStyles : Local.artistAlbum, {
          display: artist ? 'flex' : 'none'
        }]}
        numberOfLines={1}
      >
        {artist} {showAlbum && album ? `· ${album}` : ''}
      </Text>
    </View>
  );

});

export default SongInfo;