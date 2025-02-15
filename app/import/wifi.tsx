import { Text, View, Dimensions, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { Styles } from '@/src/constants/Styles';
import SongList from '@/src/components/lists/song';
import PageTitle from '@/src/components/PageTitle';
import ImportInstructions from '@/src/components/import/Instructions';
import InfoModal from '@/src/components/modals/InfoModal';
import { Colors } from '@/src/constants/Colors';
import Progress from '@/src/components/Progress';
import { PageType } from '@/src/constants/Types';
import { usePremiumContext } from '@/src/context/PremiumProvider';
import CFG from '@/src/constants/Config';
import SettingsButton from '@/src/components/SettingsButton';
import ImportBlur from '@/src/components/import/Blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WiFi = () => {

  const {

    results, transferSize, loading,
    ip, wifiDisabled,
    transferProgress, loadAnimInProgress,

    setExportDisabled,
    setShowInfoModal,

  } = useGlobalContext();

  const { premium } = usePremiumContext();
  const insets = useSafeAreaInsets();

  const Local = StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingBottom: Dimensions.get('screen').height < 700 ? 70 : 50
    },
    message: {
      marginTop: 10,
      color: Colors.text
    }
  });

  const [completion, setCompletion] = useState(0);
  const [URL, setURL] = useState('');

  useEffect(() => {

    setExportDisabled(results.length > 0 ? false : true);
    setURL(!wifiDisabled ? `${ip}` : '');

  }, []);

  useEffect(() => {
    if (transferSize > 0 && transferProgress >= 0) {
      setCompletion(((transferProgress / transferSize) * 100));
    }
  }, [transferProgress]);

  const getBody = () => {
    if (wifiDisabled) {
      return (
        <View style={[Styles.main, Local.container]}>
          <Text style={Styles.infoText}>
            Failed to start server
          </Text>
          <Text style={[Styles.sub, Local.message]}>
            Try restarting the app
          </Text>
        </View>
      );
    }
    else if (loading || loadAnimInProgress || results.length === 0) {
      return (
        <View style={[Styles.main, Local.container, {paddingBottom: 100}]}>
          <Progress 
            completion={completion} 
            loading={loading}
            showCircle={loadAnimInProgress}
          />
        </View>
      );
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

  const getInstructions = () => {
    if (!wifiDisabled && results.length === 0 && transferSize <= 0) {
      return (
        <ImportInstructions
          title='In your web browser, enter:'
          desc={`${URL}${CFG.PORT === 80 ? '' : `:${CFG.PORT}`}`}
          icon={require('@/src/assets/icons/wifi.png')}
          disabled={wifiDisabled}
          handlePress={() => {}}
        />
      );
    }
  }

  return (
    <>
      {!wifiDisabled && results.length === 0 && transferSize <= 0 &&
        <ImportInstructions
          title='In your web browser, enter:'
          desc={`${URL}${CFG.PORT === 80 ? '' : `:${CFG.PORT}`}`}
          icon={require('@/src/assets/icons/wifi.png')}
          disabled={wifiDisabled}
          handlePress={() => {}}
        />
      }
      {getBody()}
    </>
  )
}

export default WiFi;