import SheetOption from "@/src/features/action-sheet/components/SheetOption";
import { PageType } from "@/src/constants/Types";
import { usePlaylistOptions } from "@/src/features/action-sheet/hooks/use-entity-options";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { Share, SquarePen, Trash } from "lucide-react-native";

const PlaylistOptions = ({ name }: { name: string }) => {
  const { premium } = usePremiumContext();
  const { canDelete, handleDelete, handleEdit, handleExport, pageType } =
    usePlaylistOptions(name);

  return (
    <>
      <SheetOption
        icon={SquarePen}
        text={"Edit"}
        show={[PageType.LIBRARY, PageType.PLAYLIST].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption
        icon={Share}
        text={"Export"}
        show={
          [PageType.LIBRARY, PageType.PLAYLIST].includes(pageType) && premium
        }
        handler={handleExport}
        premiumOnly
      />
      <SheetOption
        icon={Trash}
        text={"Delete"}
        show={
          [PageType.LIBRARY, PageType.PLAYLIST].includes(pageType) &&
          canDelete
        }
        handler={handleDelete}
      />
    </>
  );
};

export default PlaylistOptions;
