import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { useEffect, useState } from 'react';
import PageTitle from '@/components/PageTitle';
import Loading from '@/components/Loading';
import Top from '@/components/Top';
import FilesEmpty from '@/components/import/files/FilesEmpty';
import SongList from '@/components/song/SongList';
import SaveInstructionsModal from '@/components/modals/SaveInstructionsModal';
import ImportControls from '../ImportControls';
import Progress from '@/components/Progress';

const Files = () => {

  const { 
    
    results, loading, zipping, 
    importing, premium, transferSize,
    transferProgress, loadAnimInProgress,

    setShowSaveInst,

  } = useGlobalContext();

  const [completion, setCompletion] = useState(0);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (transferSize >= 0 && transferProgress >= 0) {
      setCompletion((1 - ((transferProgress - 1) / transferSize)) * 100);
    }
  }, [transferProgress]);

  const getBody = () => {
    if (loading || loadAnimInProgress) {
      return (
        <View
          style={[Styles.main, {
            paddingBottom: 50
          }]}
        >
          <Progress 
            completion={completion} 
            showCircle={loadAnimInProgress}
          />
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
        showList={results.length > 1 && premium}
      />
      {getBody()}
      <ImportControls />
    </View>
  );
  
}

export default Files;