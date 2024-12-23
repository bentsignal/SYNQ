import { ArtistType } from "@/constants/Types";
import ArtistDataManager from "@/lib/data/ArtistDataManager";

export const createArtist = async (name: string): Promise<ArtistType> => {
  const artistId = await ArtistDataManager.getInstance().createArtist(name);
  return { id: artistId, name: name };
}

export const getArtists = async (): Promise<ArtistType[]> => {
  return await ArtistDataManager.getInstance().getArtists();
}
