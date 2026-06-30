import PlaylistSheet from "@/src/components/sheet/playlist/PlaylistSheet"
import SongSheet from "@/src/components/sheet/song/SongSheet"
import ImportSongSheet from "@/src/components/sheet/song/ImportSongSheet"
import ArtistSheet from "@/src/components/sheet/artist/ArtistSheet"
import AlbumSheet from "@/src/components/sheet/album/AlbumSheet"

const Sheets = () => {
  return (
    <>
      <PlaylistSheet name='playlist-sheet' />
      <SongSheet name='song-sheet' />
      <ImportSongSheet name='import-song-sheet' />
      <ArtistSheet name='artist-sheet' />
      <AlbumSheet name='album-sheet' />
    </>
  );
}

export default Sheets;