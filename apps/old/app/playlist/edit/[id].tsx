import { useLocalSearchParams } from "expo-router";
import EditPlaylistScreen from "@/src/features/library/components/edit/EditPlaylistScreen";

const EditPlaylistIndex = () => {
  const { id } = useLocalSearchParams();
  return <EditPlaylistScreen id={Number(id)} />;
};

export default EditPlaylistIndex;
