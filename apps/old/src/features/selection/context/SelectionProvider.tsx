import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

type SelectionContextValue = {
  selectEnabled: boolean;
  setSelectEnabled: Dispatch<SetStateAction<boolean>>;
  selectedSongs: number[];
  setSelectedSongs: Dispatch<SetStateAction<number[]>>;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export const useSelectionContext = () => {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("useSelectionContext must be used within SelectionProvider");
  }

  return context;
};

export const SelectionProvider = ({ children }: PropsWithChildren) => {
  const [selectEnabled, setSelectEnabled] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);

  const value = useMemo(
    () => ({
      selectEnabled,
      setSelectEnabled,
      selectedSongs,
      setSelectedSongs,
    }),
    [selectEnabled, selectedSongs],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};
