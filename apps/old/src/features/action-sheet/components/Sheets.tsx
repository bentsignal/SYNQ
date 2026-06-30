import PlaylistSheet from "@/src/features/action-sheet/components/playlist/PlaylistSheet"
import SongSheet from "@/src/features/action-sheet/components/song/SongSheet"
import ImportSongSheet from "@/src/features/action-sheet/components/song/ImportSongSheet"
import ArtistSheet from "@/src/features/action-sheet/components/artist/ArtistSheet"
import AlbumSheet from "@/src/features/action-sheet/components/album/AlbumSheet"

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