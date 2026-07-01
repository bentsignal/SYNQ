import SongActionSheet from "@/src/features/action-sheet/components/song/SongActionSheet";

type SongSheetProps = {
  name: string;
};

const SongSheet = ({ name }: SongSheetProps) => {
  return <SongActionSheet name={name} library />;
};

export default SongSheet;
