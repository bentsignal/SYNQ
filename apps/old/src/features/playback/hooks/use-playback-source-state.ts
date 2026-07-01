import { useState } from "react";
import { SourceType } from "@/src/constants/Types";

export const usePlaybackSourceState = () => {
  const [sourceId, setSourceId] = useState<number | null>(null);
  const [sourceType, setSourceType] = useState<SourceType | null>(null);

  return {
    setSourceId,
    setSourceType,
    sourceId,
    sourceType,
  };
};
