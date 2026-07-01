import { useLocalSearchParams } from "expo-router";
import PlaylistDetailScreen from "@/src/features/library/components/detail/PlaylistDetailScreen";

const PlaylistIndex = () => {
  const { id } = useLocalSearchParams();
  return <PlaylistDetailScreen id={Number(id)} />;
};

export default PlaylistIndex;
