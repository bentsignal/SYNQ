import { Text, View, Dimensions, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { Styles } from '@/src/constants/Styles';
import SongList from '@/src/features/library/components/lists/song';
import ImportInstructions from '@/src/features/import/components/Instructions';
import { Colors } from '@/src/constants/Colors';
import Progress from '@/src/features/import/components/Progress';
import { PageType } from '@/src/constants/Types';
import { usePremiumContext } from '@/src/features/premium/context/PremiumProvider';
import { useImportFlowContext } from '@/src/features/import/context/ImportFlowProvider';
import CFG from '@/src/constants/Config';
import ImportBlur from '@/src/features/import/components/Blur';
import { useImportTransferCompletion } from '@/src/features/import/hooks/use-import-transfer-completion';

const WiFi = () => {

  const {

    results, transferSize, loading,
    ip, wifiDisabled,
    transferProgress, loadAnimInProgress,

    setExportDisabled,

  } = useImportFlowContext();

  const { premium } = usePremiumContext();

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

  const completion = useImportTransferCompletion({
    transferProgress,
    transferSize,
  });
  const url = !wifiDisabled ? ip : '';

  useEffect(() => {

    setExportDisabled(results.length === 0);

  }, [results.length, setExportDisabled]);

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

  return (
    <>
      {!wifiDisabled && results.length === 0 && transferSize <= 0 &&
        <ImportInstructions
          title='In your web browser, enter:'
          desc={`${url}${CFG.PORT === 80 ? '' : `:${CFG.PORT}`}`}
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
