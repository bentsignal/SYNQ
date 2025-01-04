import { useLocalSearchParams } from "expo-router";
import EditAlbum from "./edit";

const EditAlbumIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <EditAlbum id={id as string} />
  )
}

export default EditAlbumIndex;
