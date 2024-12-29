import { useLocalSearchParams } from "expo-router";
import PlaylistView from "./playlist";

const PlaylistIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <PlaylistView id={id as string} />
  )
}

export default PlaylistIndex;