import { useLocalSearchParams } from "expo-router";
import EditArtist from "./edit";

const EditArtistIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <EditArtist id={Number(id)} />
  )
}

export default EditArtistIndex;