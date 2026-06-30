import { useLocalSearchParams } from "expo-router";
import EditSong from "./edit";

const EditSongIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <EditSong id={Number(id)} />
  )
}

export default EditSongIndex;