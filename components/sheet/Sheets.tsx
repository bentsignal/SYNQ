import PlaylistSheet from "@/components/sheet/playlist/PlaylistSheet"
import SongSheet from "@/components/sheet/song/SongSheet"
import ArtistSheet from "@/components/sheet/artist/ArtistSheet"

const Sheets = () => {
  return (
    <>
      <PlaylistSheet name='playlist-sheet' />
      <SongSheet name='song-sheet' />
      <ArtistSheet name='artist-sheet' />
    </>
  );
}

export default Sheets;