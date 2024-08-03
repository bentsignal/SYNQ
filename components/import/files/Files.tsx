import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import PageTitle from '@/components/PageTitle';
import Loading from '@/components/Loading';
import Top from '@/components/Top';
import FilesEmpty from '@/components/import/files/FilesEmpty';
import SongList from '@/components/song/SongList';
import SaveInstructionsModal from '@/components/modals/SaveInstructionsModal';
import ImportControls from '../ImportControls';

const Files = () => {

  const { 
    
    results, loading,
    zipping, importing,

    setShowSaveInst, 

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
      );
    }
    else {
      return (
        <FilesEmpty />
      );
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
      <ImportControls />
    </View>
  );
  
}

export default Files;