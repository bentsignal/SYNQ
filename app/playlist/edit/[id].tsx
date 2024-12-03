import { useLocalSearchParams } from "expo-router";
import EditPlaylist from "./edit";

const EditPlaylistIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <EditPlaylist id={id as string} />
  )
}

export default EditPlaylistIndex;
