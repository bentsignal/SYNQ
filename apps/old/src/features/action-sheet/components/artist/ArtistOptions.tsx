import SheetOption from "@/src/features/action-sheet/components/SheetOption";
import { PageType } from "@/src/constants/Types";
import { useArtistOptions } from "@/src/features/action-sheet/hooks/use-entity-options";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { Share, SquarePen, Trash } from "lucide-react-native";

const ArtistOptions = ({ name }: { name: string }) => {
  const { premium } = usePremiumContext();
  const { handleDelete, handleEdit, handleExport, pageType } =
    useArtistOptions(name);

  return (
    <>
      <SheetOption
        icon={SquarePen}
        text={"Edit"}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption
        icon={Share}
        text={"Export"}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType) && premium}
        handler={handleExport}
        premiumOnly
      />
      <SheetOption
        icon={Trash}
        text={"Delete"}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType)}
        handler={handleDelete}
      />
    </>
  );
};

export default ArtistOptions;
