import { useActionSheetContext } from '@/src/features/action-sheet/context/ActionSheetProvider';
import { CoverType } from '@/src/constants/Types';
import AlbumOptions from './AlbumOptions';
import EntityActionSheet from "@/src/features/action-sheet/components/entity/EntityActionSheet";

const AlbumSheet = ({name}: {name: string}) => {

  const { editAlbum } = useActionSheetContext();

  return (
    <EntityActionSheet
      coverType={CoverType.ALBUM}
      image={editAlbum?.image}
      name={name}
      subtitle={editAlbum?.year}
      title={editAlbum?.name}
    >
        <AlbumOptions name={name}/>
    </EntityActionSheet>
  );
}

export default AlbumSheet;
