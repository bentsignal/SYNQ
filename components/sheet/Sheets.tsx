import PlaylistSheet from "@/components/sheet/playlist/PlaylistSheet"
import SongSheet from "@/components/sheet/song/SongSheet"

const Sheets = () => {
  return (
    <>
      <PlaylistSheet name='playlist-sheet' />
      <SongSheet name='song-sheet' />
    </>
  );
}

export default Sheets;