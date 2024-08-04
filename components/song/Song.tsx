import { View, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { SongType } from '@/constants/Types';
import SongInfo from '@/components/song/SongInfo';
import EditButton from '@/components/song/EditButton';
import DeleteButton from '@/components/song/DeleteButton';
import Select from '@/components/song/Select';
import { ListCover } from '@/components/song/Cover';
import { BlurView } from 'expo-blur';
import CustomButton from '../CustomButton';

const Song = ({name, id, data, info}: SongType) => {

  const [selected, setSelected] = useState(false);
  const { 

    selectEnabled, selectedSongs, results,
    premium,

    setSelectedSongs 

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

  return (
    <>
      <View
        style={[Styles.roundedContainer, {
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
        }]}
      >
        <ListCover image={info.metadata?.artwork ? info.metadata.artwork : ''}/>
        <SongInfo info={info} name={name}/>
        {

          selectEnabled 

          ? 

          <>
            <TouchableOpacity
              onPress={() => {
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
            >
              <Select active={selected} />
            </TouchableOpacity>
          </> 

          : 

          <>
            <EditButton name={name} id={id} data={data} info={info}/>
            <DeleteButton name={name} id={id}/>
          </>

        }
      </View>
      <BlurView
        style={[Styles.roundedContainer, {
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
          zIndex: 1
        }]}
        intensity={20}
      >
        <View
          style={{
            display: message ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
            paddingBottom: 5,
            textShadowColor: Colors.background,
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 10
          }}
        >
          Import multiple files with <Text style={{color: Colors.main}}>Premium</Text>
        </Text>
        <CustomButton 
          title={'Sign Up'}
          background={Colors.main}
          disabledColor={Colors.disabled}
          opacity={.90}
          handlePress={() => router.push('/premium')}
        />
        </View>
      </BlurView>
    </>
  );

}

export default Song;