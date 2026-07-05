export const getCollectionFormActionState = ({
  isMissing = false,
  isSaving,
  name,
}: {
  isMissing?: boolean;
  isSaving: boolean;
  name: string;
}) => {
  const hasName = name.trim().length > 0;
  const canEdit = !isSaving && !isMissing;
  const canSave = hasName && canEdit;

  return {
    canEdit,
    canPickImage: canEdit,
    canSave,
    hasName,
  };
};

export type CollectionFormActionState = ReturnType<
  typeof getCollectionFormActionState
>;
