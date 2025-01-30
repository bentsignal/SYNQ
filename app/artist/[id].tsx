import ArtistView from "./artist";
import { useLocalSearchParams } from "expo-router";

const ArtistIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <ArtistView id={Number(id)} />
  )
}

export default ArtistIndex;