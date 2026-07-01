import { Styles } from "@/src/constants/Styles";
import { PageType } from "@/src/constants/Types";
import ImportBlur from "@/src/features/import/components/Blur";
import Progress from "@/src/features/import/components/Progress";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useImportTransferCompletion } from "@/src/features/import/hooks/use-import-transfer-completion";
import SongList from "@/src/features/library/components/lists/song";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { View } from "react-native";

const ImportFilesScreen = () => {
  const {
    results,
    loading,
    transferSize,
    transferProgress,
    loadAnimInProgress,
  } = useImportFlowContext();

  const { premium } = usePremiumContext();
  const completion = useImportTransferCompletion({
    transferProgress,
    transferSize,
  });

  const renderBody = () => {
    if (loading || loadAnimInProgress) {
      return (
        <View
          style={[
            Styles.main,
            {
              paddingBottom: 100,
            },
          ]}
        >
          <Progress
            completion={completion}
            loading={loading}
            showCircle={loadAnimInProgress}
          />
        </View>
      );
    } else if (results.length > 0) {
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
    } else {
      return <></>;
    }
  };

  return renderBody();
};

export default ImportFilesScreen;
