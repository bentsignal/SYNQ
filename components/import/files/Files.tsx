import { Text, View, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useEffect, useReducer, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

const getShowSaveInst = async () => {
  return await AsyncStorage.getItem('showSaveInst')
}

const Files = () => {

  const { homeState, setHomeState, results, setResults,
    exportDisabled, setExportDisabled, loading, setLoading,
    zipping, setZipping, importing, setImporting, setShowSaveInst, 
    selectEnabled, setSelectEnabled, selectedSongs, showDelete, 
    setShowDelete, deleteSong, setEditSong, setShowEdit
  } = useGlobalContext();

  const insets = useSafeAreaInsets();

  const getBody = () => {
    if (loading) {
      let message = <></>
      if (zipping) {
        message = 
          <Text style={Styles.infoText}>
            Preparing your files...
          </Text>
      }
      else if (importing) {
        message =
          <Text style={Styles.infoText}>
            Importing your files...
          </Text>
      }
      return (
        <View
          style={[Styles.main, {
            paddingBottom: 50
          }]}
        >
          {message}
          <Loading height={100} width={200}/>
          {/* <ActivityIndicator style={{
              padding: 20
          }}/> */}
        </View>
      )
    }
    else if (results.length > 0) {
      return (
        <SongList songs={results} />
      )
    }
    else {
      return (
        <FilesEmpty />
      )
    }
  }

  return (
    <View style={[Styles.body, {paddingTop: insets.top}]}>
      <SaveInstructionsModal dontShowOption={true} />
      <Top />
      <PageTitle 
        title='Import Music'
        infoHandler={() => setShowSaveInst(true)}
        showList={true}
      />
      {getBody()}
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
            setHomeState(0)
            setResults([])
            setExportDisabled(true)
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
                setResults([]);
              })
              .catch((error) => {
                console.log(error)
                console.log('failed to export files')
                setLoading(false);
                setZipping(false);
                setHomeState(4);
                setResults([]);
              })
            }, 1000)
          }}
          disabled={exportDisabled}
        />
      </View>
    </View>
  )
}

export default Files;