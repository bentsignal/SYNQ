import { useActionSheetContext } from '@/src/features/action-sheet/context/ActionSheetProvider';
import { CoverType } from '@/src/constants/Types';
import PlaylistOptions from '@/src/features/action-sheet/components/playlist/PlaylistOptions';
import EntityActionSheet from "@/src/features/action-sheet/components/entity/EntityActionSheet";

const PlaylistSheet = ({name}: {name: string}) => {

  const { editPlaylist } = useActionSheetContext();
  const songCount = editPlaylist?.songCount;
  const subtitle =
    songCount === undefined
      ? undefined
      : `${songCount} ${songCount === 1 ? 'song' : 'songs'}`;

  return (
    <EntityActionSheet
      coverType={CoverType.PLAYLIST}
      id={editPlaylist?.id}
      image={editPlaylist?.image}
      name={name}
      subtitle={subtitle}
      title={editPlaylist?.name}
    >
        <PlaylistOptions name={name}/>
    </EntityActionSheet>
  );
}

export default PlaylistSheet;
