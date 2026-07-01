import { useLocalSearchParams } from "expo-router";
import EditSongScreen from "@/src/features/library/components/edit/EditSongScreen";

const EditSongIndex = () => {
  const { id } = useLocalSearchParams();
  return <EditSongScreen id={Number(id)} />;
};

export default EditSongIndex;
