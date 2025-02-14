import { useLocalSearchParams } from "expo-router";
import PlaylistView from "@/app/playlist/playlist";

const PlaylistIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <PlaylistView id={Number(id)} />
  )
}

export default PlaylistIndex;