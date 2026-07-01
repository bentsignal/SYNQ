import SheetOption from "@/src/features/action-sheet/components/SheetOption";
import { PageType } from "@/src/constants/Types";
import { useAlbumOptions } from "@/src/features/action-sheet/hooks/use-entity-options";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import {
  ListChevronsUpDown,
  Share,
  SquarePen,
  Trash,
} from "lucide-react-native";

const AlbumOptions = ({ name }: { name: string }) => {
  const { premium } = usePremiumContext();
  const { handleDelete, handleEdit, handleExport, handleReorder, pageType } =
    useAlbumOptions(name);

  return (
    <>
      <SheetOption
        icon={SquarePen}
        text={"Edit"}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption
        icon={ListChevronsUpDown}
        text={"Reorder"}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType)}
        handler={handleReorder}
      />
      <SheetOption
        icon={Share}
        text={"Export"}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType) && premium}
        handler={handleExport}
        premiumOnly
      />
      <SheetOption
        icon={Trash}
        text={"Delete"}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType)}
        handler={handleDelete}
      />
    </>
  );
};

export default AlbumOptions;
