import { View, Text } from 'react-native';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { Styles } from '@/src/constants/Styles';
import { useEffect, useState } from 'react';
import PageTitle from '@/src/components/PageTitle';
import { getCompletion } from '@/lib/Util';
import SongList from '@/src/components/lists/song';
import Progress from '@/src/components/Progress';
import InfoModal from '@/src/components/modals/InfoModal';
import { PageType } from '@/src/constants/Types';
import { usePremiumContext } from '@/src/context/PremiumProvider';
import SettingsButton from '@/src/components/SettingsButton';
import ImportBlur from '@/src/components/import/Blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Files = () => {

  const { 
    
    results, loading,
    transferSize,
    transferProgress, loadAnimInProgress,

    setShowInfoModal,

  } = useGlobalContext();

  const { premium } = usePremiumContext();

  const [completion, setCompletion] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (transferSize >= 0 && transferProgress >= 0) {
      setCompletion(getCompletion(transferSize, transferProgress));
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
            loading={loading}
            showCircle={loadAnimInProgress}
          />
        </View>
      )
    }
    else if (results.length > 0) {
      return (
        <>
          <SongList
            songs={results}
            bottomPadding={true}
            pageType={PageType.IMPORT}
            fadeCover={false}
            fadeSong={true}
            lockScroll={!premium}
          />
          {!premium && <ImportBlur />}
        </>
      );
    }
    else {
      return (
        <></>
      );
    }
  }

  return getBody();
  
}

export default Files;