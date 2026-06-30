import {
  getAudioDurationFromFile,
  getMetadataFromFile,
  getTrackNumberFromString,
} from "@synq/audio";
import { db } from "@synq/db";
import { songs } from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { DocumentPickerAsset } from "expo-document-picker";
import { saveCoverImage } from "@/src/features/images/repository/image-repository";
import {
  addArtistToLibraryAlbum,
  getLibraryAlbumFromMetadata,
  getLibraryArtistsFromMetadata,
} from "@/src/features/library/repository/library-entity-repository";
import {
  addAlbumToLibrarySong,
  addArtistToLibrarySong,
} from "@/src/features/library/repository/library-song-repository";
import { saveLibrarySongSnapshot } from "@/src/features/library/repository/song-metadata-repository";

export const createIngestedSongFromAsset = async (
  asset: DocumentPickerAsset,
) => {
  const metadata = await getMetadataFromFile(asset.uri);
  const duration = await getAudioDurationFromFile(asset.uri);
  const coverImageHash = await saveCoverImage(metadata.artwork);
  const { strippedValue: songTitle, trackNumber } = getTrackNumberFromString(
    metadata.name ?? asset.name,
  );
  const metadataTrack =
    typeof metadata.track === "number" ? metadata.track : trackNumber ?? undefined;
  const insertResult = await db.insert(songs).values({
    title: songTitle,
    duration,
    fileType: asset.mimeType ?? null,
    pathToFile: asset.uri,
    originalFileName: asset.name,
    coverImage: coverImageHash,
  });
  const songId = insertResult.lastInsertRowId;
  const songArtists = await storeArtistsForNewSong(songId, metadata.artist);
  const songAlbums = await storeAlbumsForNewSong(
    songId,
    metadata.album,
    metadata.artwork,
    metadataTrack,
  );
  await storeArtistsForNewAlbums(songArtists, songAlbums);
  await saveLibrarySongSnapshot(songId);
  await db
    .update(songs)
    .set({ ingestComplete: 1 })
    .where(eq(songs.id, songId));
};

export const digest = createIngestedSongFromAsset;

const storeArtistsForNewSong = async (
  songId: number,
  artistsInMetadata?: string,
) => {
  if (!artistsInMetadata) return [];

  const artists = await getLibraryArtistsFromMetadata(artistsInMetadata);

  for (const artist of artists) {
    await addArtistToLibrarySong(artist.id, songId);
  }

  return artists;
};

const storeAlbumsForNewSong = async (
  songId: number,
  albumsInMetadata?: string,
  artwork?: string,
  track?: number,
) => {
  if (!albumsInMetadata) return [];

  const albumNames = albumsInMetadata
    .split(",")
    .map((album) => album.trim())
    .filter((album) => album !== "");

  const albums = (
    await Promise.all(
      albumNames.map((albumName) =>
        getLibraryAlbumFromMetadata(albumName, undefined, artwork),
      ),
    )
  ).filter((album) => album !== null);

  for (const album of albums) {
    await addAlbumToLibrarySong(album.id, songId, track);
  }

  return albums;
};

const storeArtistsForNewAlbums = async (
  artists: Awaited<ReturnType<typeof storeArtistsForNewSong>>,
  albums: Awaited<ReturnType<typeof storeAlbumsForNewSong>>,
) => {
  await Promise.all(
    albums.flatMap((album) =>
      artists.map((artist) => addArtistToLibraryAlbum(artist.id, album.id)),
    ),
  );
};
