import ImportBlur from "@/src/features/import/components/Blur";
import SongList from "@/src/features/library/components/lists/song";
import Progress from "@/src/features/import/components/Progress";
import { Styles } from "@/src/constants/Styles";
import { PageType } from "@/src/constants/Types";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useImportTransferCompletion } from "@/src/features/import/hooks/use-import-transfer-completion";
import { View } from "react-native";

const Files = () => {
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

  const getBody = () => {
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

  return getBody();
};

export default Files;
