import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  AlbumType,
  ArtistType,
  PlaylistType,
  SongType,
} from "@/src/constants/Types";

type ActionSheetContextValue = {
  editSong: SongType;
  setEditSong: Dispatch<SetStateAction<SongType>>;
  numModified: number;
  setNumModified: Dispatch<SetStateAction<number>>;
  editPlaylist: PlaylistType;
  setEditPlaylist: Dispatch<SetStateAction<PlaylistType>>;
  editArtist: ArtistType;
  setEditArtist: Dispatch<SetStateAction<ArtistType>>;
  editAlbum: AlbumType;
  setEditAlbum: Dispatch<SetStateAction<AlbumType>>;
};

const ActionSheetContext = createContext<ActionSheetContextValue | null>(null);

export const useActionSheetContext = () => {
  const context = useContext(ActionSheetContext);

  if (!context) {
    throw new Error(
      "useActionSheetContext must be used within ActionSheetProvider",
    );
  }

  return context;
};

export const ActionSheetProvider = ({ children }: PropsWithChildren) => {
  const [editSong, setEditSong] = useState({} as SongType);
  const [numModified, setNumModified] = useState(0);
  const [editPlaylist, setEditPlaylist] = useState({} as PlaylistType);
  const [editArtist, setEditArtist] = useState({} as ArtistType);
  const [editAlbum, setEditAlbum] = useState({} as AlbumType);

  const value = useMemo(
    () => ({
      editSong,
      setEditSong,
      numModified,
      setNumModified,
      editPlaylist,
      setEditPlaylist,
      editArtist,
      setEditArtist,
      editAlbum,
      setEditAlbum,
    }),
    [editAlbum, editArtist, editPlaylist, editSong, numModified],
  );

  return (
    <ActionSheetContext.Provider value={value}>
      {children}
    </ActionSheetContext.Provider>
  );
};
