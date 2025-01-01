import ArtistView from "./artist";
import { useLocalSearchParams } from "expo-router";

const ArtistIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <ArtistView id={id as string} />
  )
}

export default ArtistIndex;