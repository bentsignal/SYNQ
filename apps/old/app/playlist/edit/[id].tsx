import { useLocalSearchParams } from "expo-router";
import EditPlaylist from "./edit";

const EditPlaylistIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <EditPlaylist id={Number(id)} />
  )
}

export default EditPlaylistIndex;
