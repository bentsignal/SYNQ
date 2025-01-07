import PlaylistSheet from "@/components/sheet/playlist/PlaylistSheet"
import SongSheet from "@/components/sheet/song/SongSheet"
import ArtistSheet from "@/components/sheet/artist/ArtistSheet"
import AlbumSheet from "@/components/sheet/album/AlbumSheet"

const Sheets = () => {
  return (
    <>
      <PlaylistSheet name='playlist-sheet' />
      <SongSheet name='song-sheet' />
      <ArtistSheet name='artist-sheet' />
      <AlbumSheet name='album-sheet' />
    </>
  );
}

export default Sheets;