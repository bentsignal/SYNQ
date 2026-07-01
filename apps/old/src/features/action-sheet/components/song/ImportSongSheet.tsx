import SongActionSheet from "@/src/features/action-sheet/components/song/SongActionSheet";

type SongSheetProps = {
  name: string;
};

export default function ImportSongSheet({ name }: SongSheetProps) {
  return <SongActionSheet name={name} />;
}
