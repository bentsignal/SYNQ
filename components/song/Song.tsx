import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { SongType } from '@/constants/Types';
import SongInfo from '@/components/song/SongInfo';
import Select from '@/components/song/Select';
import { ListCover } from '@/components/song/Cover';
import { BlurView } from 'expo-blur';
import CustomButton from '../CustomButton';
import Skeleton from '../Skeleton';
import { darkenColor } from '@/lib/ColorManager';
import * as Haptics from 'expo-haptics';
import More from '@/components/More';

const Song = ({name, id, data, info}: SongType) => {

  const [selected, setSelected] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { 

    selectEnabled, selectedSongs, results,
    premium, showSongOptions, theme, 
    haptic,

    setSelectedSongs, setShowSongOptions,
    setEditSong,

  } = useGlobalContext(); 

  let blur = false;
  let message = false
  if (results && results[0] && results[1] && results[0].id && results[1].id) {
    if (!premium) {
      if (results[0].id != id) {
        blur = true;
      }
      if (results[1].id == id) {
        message = true;
      }
    }
  }

  useEffect(() => {
    setSelected(false);
    if (!selectEnabled) {
      setSelectedSongs([]);
    }
  }, [selectEnabled]);

  const Local = StyleSheet.create({
    mainContainer: {
      ...Styles.roundedContainer,
      alignSelf: 'stretch',
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: 90,
      marginBottom: 10,
      backgroundColor: blur ? Colors.background : Colors.song,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      opacity: !selectEnabled || (selectEnabled && selected) ? 1 : 0.6
    },
    skeleton: {
      ...Styles.roundedContainer,
      position: 'absolute',
      width: '90%',
      height: 90,
      zIndex: 1,
    },
    blur: {
      ...Styles.roundedContainer,
      display: blur ? 'flex' : 'none',
      overflow: 'hidden',
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      top: 0,
      left: 0,
      width: '90%',
      height: 90,
      padding: 15,
      zIndex: 2
    },
    premiumMessageContainer: {
      display: message ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center'
    },
    premiumMessageText: {
      ...Styles.infoText,
      paddingBottom: 5,
      textShadowColor: Colors.background,
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 10
    }
  });

  return (
    <>
      <View style={Local.mainContainer}>
        <ListCover 
          image={info.metadata?.artwork ? info.metadata.artwork : ''}
          propOnLoad={() => {
            setLoaded(true);
          }}
        />
        <SongInfo info={info} name={name}/>
        {

          selectEnabled 

          ? 
          
          <Select 
            active={selected} 
            handlePress={() => {
              setSelected(!selected);
              let newSongs = [];
              let i = 0;
              if (!selected && !selectedSongs.includes(id)) {
                if (selectedSongs.length == 0) {
                  newSongs[0] = id;
                }
                else {
                  for (i = 0; i < selectedSongs.length; i++) {
                    newSongs[i] = selectedSongs[i];
                  }
                  newSongs[i] = id;
                }
                setSelectedSongs(newSongs);
              }
              else if (selected) {
                for (i = 0; i < selectedSongs.length; i++) {
                  if (selectedSongs[i] != id) {
                    newSongs.push(selectedSongs[i]);
                  }
                }
                setSelectedSongs(newSongs);
              }
            }}
          />

          : 

          <More 
            handlePress={() => {
              if (haptic) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setEditSong({
                "name": name, 
                "id": id, 
                "data": data, 
                "info": info
              });
              setShowSongOptions(!showSongOptions);
            }}
          />

        }
      </View>
      <Skeleton
        show={!loaded}
        styles={Local.skeleton}
      />
      <BlurView
        style={Local.blur}
        intensity={20}
      >
        <View style={Local.premiumMessageContainer}>
          <Text style={Local.premiumMessageText}>
            Import multiple files with <Text style={{color: theme}}>Premium</Text>
          </Text>
          <CustomButton 
            title={'Sign Up'}
            background={theme}
            disabledColor={darkenColor(theme, 40, 50)}
            opacity={.90}
            handlePress={() => router.push('/premium')}
          />
        </View>
      </BlurView>
    </>
  );

}

export default Song;