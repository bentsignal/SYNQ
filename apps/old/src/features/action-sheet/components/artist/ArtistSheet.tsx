import { useActionSheetContext } from '@/src/features/action-sheet/context/ActionSheetProvider';
import { CoverType } from '@/src/constants/Types';
import ArtistOptions from '@/src/features/action-sheet/components/artist/ArtistOptions';
import EntityActionSheet from "@/src/features/action-sheet/components/entity/EntityActionSheet";

const ArtistSheet = ({name}: {name: string}) => {

  const { editArtist } = useActionSheetContext();

  return (
    <EntityActionSheet
      coverType={CoverType.ARTIST}
      image={editArtist?.image}
      name={name}
      title={editArtist?.name}
    >
        <ArtistOptions name={name}/>
    </EntityActionSheet>
  );
}

export default ArtistSheet;
