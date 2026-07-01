import AlbumDetailScreen from "@/src/features/library/components/detail/AlbumDetailScreen";
import { useLocalSearchParams } from "expo-router";

const AlbumIndex = () => {
  const { id } = useLocalSearchParams();
  return <AlbumDetailScreen id={Number(id)} />;
};

export default AlbumIndex;
