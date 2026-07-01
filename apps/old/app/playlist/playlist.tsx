import PlaylistDetailScreen from "@/src/features/library/components/detail/PlaylistDetailScreen";

const PlaylistView = ({ id }: { id: number }) => {
  return <PlaylistDetailScreen id={id} />;
};

export default PlaylistView;
