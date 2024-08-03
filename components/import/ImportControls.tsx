import { Text, View, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useEffect, useReducer, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios';

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import PageTitle from '@/components/PageTitle'
import Loading from '@/components/Loading';
import Top from '@/components/Top'
import FilesEmpty from '@/components/import/files/FilesEmpty'
import SongList from '@/components/song/SongList'
import CustomButton from '@/components/CustomButton'
import SaveInstructionsModal from '@/components/modals/SaveInstructionsModal';
import { exportSongs, removeSongs } from '@/lib/SongManager'

const ImportControls = ({reset}: {reset?: () => void}) => {

  const { homeState, setHomeState, results, setResults,
    exportDisabled, setExportDisabled, loading, setLoading,
    zipping, setZipping, importing, setImporting, setShowSaveInst, 
    selectEnabled, setSelectEnabled, selectedSongs, showDelete, 
    setShowDelete, deleteSong, setEditSong, setShowEdit,
    setTransferSize
  } = useGlobalContext();

  return (
    <>
      <View
        style={{
          position: 'absolute',
          bottom: 10,
          display: selectEnabled && selectedSongs.length > 0 ? 'flex' : 'none',
          flexDirection: 'row',
          gap: 10
        }}
      >
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, {
            backgroundColor: Colors.song,
            padding: 15
          }]}
          onPress={() => {
            setEditSong({
              "name": "",
              "id": "",
              "data": "",
              "info": ""
            })
            setShowEdit(true);
          }}
        >
          <Image 
            source={require('@/assets/icons/edit.png')}
            style={{
              width: 20,
              height: 20,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, {
            backgroundColor: Colors.song,
            padding: 15
          }]}
          onPress={() => setShowDelete(true)}
        >
          <Image 
            source={require('@/assets/icons/delete.png')}
            style={{
              width: 20,
              height: 20,
            }}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          display: selectEnabled ? 'none' : 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          position: 'absolute',
          padding: 5,
          bottom: 10
        }}
      >
        <CustomButton 
          title='Cancel'
          background={Colors.text}
          handlePress={() => {
            setLoading(false);
            setZipping(false);
            setImporting(false);
            setTransferSize(0);
            setHomeState(0);
            setResults([]);
            setExportDisabled(true);
            if (reset) {
              console.log('reset')
              reset();
            }
          }}
        />
        <CustomButton 
          title='Export'
          background={Colors.main}
          handlePress={() => {
            setExportDisabled(true);
            setLoading(true);
            setZipping(true);
            setTimeout(() => {
              exportSongs(results).then(() => {
                setLoading(false);
                setZipping(false);
                setHomeState(3);
                setTransferSize(0);
                setResults([]);
                if (reset) {
                  console.log('reset')
                  reset();
                }
              })
              .catch((error) => {
                setLoading(false);
                setZipping(false);
                setHomeState(4);
                setTransferSize(0);
                setResults([]);
                if (reset) {
                  console.log('reset')
                  reset();
                }
              })
            }, 1000)
          }}
          disabled={exportDisabled}
        />
      </View>
    </>
  );
}

export default ImportControls;