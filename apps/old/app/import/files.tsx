import { useEffect, useState } from "react";
import ImportBlur from "@/src/components/import/Blur";
import SongList from "@/src/components/lists/song";
import Progress from "@/src/components/Progress";
import { Styles } from "@/src/constants/Styles";
import { PageType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { getCompletion } from "@/src/lib/util";
import { Text, View } from "react-native";

const Files = () => {
  const {
    results,
    loading,
    transferSize,
    transferProgress,
    loadAnimInProgress,
  } = useGlobalContext();

  const { premium } = usePremiumContext();

  const [completion, setCompletion] = useState(0);
  useEffect(() => {
    if (transferSize >= 0 && transferProgress >= 0) {
      setCompletion(getCompletion(transferSize, transferProgress));
    }
  }, [transferProgress]);

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
