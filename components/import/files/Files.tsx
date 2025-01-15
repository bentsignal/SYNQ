import { View } from 'react-native';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { useEffect, useState } from 'react';
import PageTitle from '@/components/PageTitle';
import { getCompletion } from '@/lib/Util';
import SongList from '@/components/lists/song';
import ImportControls from '../ImportControls';
import Progress from '@/components/Progress';
import InfoModal from '@/components/modals/InfoModal';
import { PageType } from '@/constants/Types';
import { usePremiumContext } from '@/src/context/PremiumProvider';
import SettingsButton from '@/components/SettingsButton';

const Files = () => {

  const { 
    
    results, loading,
    transferSize,
    transferProgress, loadAnimInProgress,
    homeState, exportDisabled,

    setShowInfoModal, setHomeState,
    setImportState, setLoading,
    setTransferSize, setResults, setExportDisabled,

  } = useGlobalContext();

  const { premium } = usePremiumContext();

  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    if (transferSize >= 0 && transferProgress >= 0) {
      setCompletion(getCompletion(transferSize, transferProgress));
    }
  }, [transferProgress]);

  const handleCancel = () => {
    setLoading(false);
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
        title='Import Files'
        infoHandler={() => setShowInfoModal(true)}
        showList={false && results.length > 1 && premium}
        rightHandComponent={<SettingsButton />}
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