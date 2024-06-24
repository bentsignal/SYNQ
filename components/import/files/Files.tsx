import { Text, View, Image, ActivityIndicator } from 'react-native'
import { useEffect, useReducer } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import PageTitle from '@/components/PageTitle'
import Top from '@/components/Top'
import FilesEmpty from '@/components/import/files/FilesEmpty'
import SongList from '@/components/song/SongList'
import CustomButton from '@/components/CustomButton'
import { exportSongs } from '@/lib/SongManager'

const Files = () => {

  const { homeState, setHomeState, fileResults, setFileResults,
    importDisabled, setImportDisabled, loading, setLoading,
    zipping, setZipping, importing, setImporting
  } = useGlobalContext();

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
        message=
          <Text style={Styles.infoText}>
            Importing your files...
          </Text>
      }
      return (
        <View
          style={{
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
            height: '75%',
            marginBottom: 10
          }}
        >
          {message}
          <ActivityIndicator style={{
              padding: 20
          }}/>
        </View>
      )
    }
    else if (fileResults.length > 0) {
      return (
        <SongList songs={fileResults} />
      )
    }
    else {
      return (
        <FilesEmpty />
      )
    }
  }

  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Import Music' />
      {getBody()}
      <View
        style={{
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
            setFileResults([])
            setImportDisabled(true)
          }}
        />
        <CustomButton 
          title='Import'
          background={Colors.main}
          handlePress={() => {
            setImportDisabled(true);
            setLoading(true);
            setZipping(true);
            setTimeout(() => {
              exportSongs(fileResults).then(() => {
                setLoading(false);
                setZipping(false);
                // router.replace('/library');
                setHomeState(0);
                setFileResults([]);
              })
              .catch((error) => {
                console.log(error)
                console.log('failed to export files')
                setLoading(false);
                setZipping(false);
                setHomeState(0);
                setFileResults([]);
              })
            }, 1000)
          }}
          disabled={importDisabled}
        />
      </View>
    </SafeAreaView>
  )
}

export default Files;