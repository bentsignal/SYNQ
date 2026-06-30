import ArtistView from "@/app/artist/artist";
import { useLocalSearchParams } from "expo-router";

const ArtistIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <ArtistView id={Number(id)} />
  )
}

export default ArtistIndex;