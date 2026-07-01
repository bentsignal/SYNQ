import { useLocalSearchParams } from "expo-router";
import EditArtistScreen from "@/src/features/library/components/edit/EditArtistScreen";

const EditArtistIndex = () => {
  const { id } = useLocalSearchParams();
  return <EditArtistScreen id={Number(id)} />;
};

export default EditArtistIndex;
