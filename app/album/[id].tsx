import AlbumView from "./album";
import { useLocalSearchParams } from "expo-router";

const AlbumIndex = () => {
  const { id } = useLocalSearchParams();
  return (
    <AlbumView id={id as string} />
  )
}

export default AlbumIndex;
