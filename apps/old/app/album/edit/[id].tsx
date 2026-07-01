import { useLocalSearchParams } from "expo-router";
import EditAlbumScreen from "@/src/features/library/components/edit/EditAlbumScreen";

const EditAlbumIndex = () => {
  const { id } = useLocalSearchParams();
  return <EditAlbumScreen id={Number(id)} />;
};

export default EditAlbumIndex;
