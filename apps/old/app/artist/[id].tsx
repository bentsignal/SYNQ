import ArtistDetailScreen from "@/src/features/library/components/detail/ArtistDetailScreen";
import { useLocalSearchParams } from "expo-router";

const ArtistIndex = () => {
  const { id } = useLocalSearchParams();
  return <ArtistDetailScreen id={Number(id)} />;
};

export default ArtistIndex;
