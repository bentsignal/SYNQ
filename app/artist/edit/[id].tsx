import { useLocalSearchParams } from "expo-router";
import EditArtist from "./edit";

const EditArtistIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <EditArtist id={id as string} />
  )
}

export default EditArtistIndex;