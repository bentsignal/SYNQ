import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import {
  usePlaybackQueueFilterContext,
  usePlaybackSourceContext,
} from "@/src/features/playback/context/PlaybackProvider";
import { playbackStorageKeys } from "@/src/features/playback/lib/playback-storage-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PlaybackSource = {
  id: number;
  type: SourceType;
};

type PlaybackSourcePersistenceParams = {
  sort: SortType;
  order: SortOrder;
  query: string;
};

export const usePlaybackSourcePersistence = ({
  sort,
  order,
  query,
}: PlaybackSourcePersistenceParams) => {
  const { setSourceId, setSourceType } = usePlaybackSourceContext();
  const { setOrder, setQuery, setSort } = usePlaybackQueueFilterContext();

  const persistPlaybackSource = async (source: PlaybackSource) => {
    setSourceType(source.type);
    await AsyncStorage.setItem(
      playbackStorageKeys.sourceType,
      source.type.toString(),
    );
    setSourceId(source.id);
    await AsyncStorage.setItem(
      playbackStorageKeys.sourceId,
      source.id.toString(),
    );
    setSort(sort);
    setOrder(order);
    setQuery(query);
  };

  return { persistPlaybackSource };
};
