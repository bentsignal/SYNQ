import { useMemo } from "react";
import { getCompletion } from "@/src/lib/util";

type ImportTransferProgress = {
  transferProgress: number;
  transferSize: number;
};

export function useImportTransferCompletion({
  transferProgress,
  transferSize,
}: ImportTransferProgress) {
  return useMemo(() => {
    if (transferSize <= 0 || transferProgress < 0) {
      return 0;
    }

    return getCompletion(transferSize, transferProgress);
  }, [transferProgress, transferSize]);
}
