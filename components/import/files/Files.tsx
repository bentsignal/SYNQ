import { View } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { useEffect, useState } from 'react';
import PageTitle from '@/components/PageTitle';
import { getCompletion } from '@/lib/SongManager';
import SongList from '@/components/song/SongList';
import ImportControls from '../ImportControls';
import Progress from '@/components/Progress';
import InfoModal from '@/components/modals/InfoModal';
import { PageType } from '@/constants/Types';

const Files = () => {

  const { 
    
    results, loading, zipping, 
    importing, premium, transferSize,
    transferProgress, loadAnimInProgress,
    homeState, exportDisabled,

    setShowInfoModal, setHomeState,
    setImportState, setLoading, setZipping, setImporting,
    setTransferSize, setResults, setExportDisabled,

  } = useGlobalContext();

  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    if (transferSize >= 0 && transferProgress >= 0) {
      setCompletion(getCompletion(transferSize, transferProgress));
    }
  }, [transferProgress]);

  const handleCancel = () => {
    setLoading(false);
    setZipping(false);
    setImporting(false);
    setTransferSize(0);
    setHomeState(0);
    setResults([]);
    setExportDisabled(true);
  }

  const handleNext = () => {
    setImportState(homeState);
    setHomeState(5);
  }

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
            loading={loading}
            showCircle={loadAnimInProgress}
          />
        </View>
      )
    }
    else if (results.length > 0) {
      return (
        <SongList
          songs={results}
          bottomPadding={true}
          pageType={PageType.IMPORT}
          fadeCover={false}
          fadeSong={true}
        />
      );
    }
    else {
      return (
        <></>
      );
    }
  }

  return (
    <View style={Styles.body}>
      <InfoModal />
      <PageTitle 
        title='Import Music'
        infoHandler={() => setShowInfoModal(true)}
        showList={results.length > 1 && premium}
      />
      {getBody()}
      <ImportControls 
        altTitle='Cancel'
        mainTitle='Next'
        altHandle={handleCancel}
        mainHandle={handleNext}
        altDisabled={loading}
        mainDisabled={exportDisabled}
      />
    </View>
  );
  
}

export default Files;