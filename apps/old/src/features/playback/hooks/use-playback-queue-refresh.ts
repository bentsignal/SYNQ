import { useCallback, useState } from "react";

export const usePlaybackQueueRefresh = () => {
  const [queueRevision, setQueueRevision] = useState(0);

  const requestQueueRefresh = useCallback(() => {
    setQueueRevision((value) => value + 1);
  }, []);

  return {
    queueRevision,
    requestQueueRefresh,
  };
};
