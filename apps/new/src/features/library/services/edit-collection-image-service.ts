export const getEditCollectionImagePath = ({
  getImagePath,
  imageHash,
}: {
  getImagePath: (imageHash: string) => string;
  imageHash: string | null | undefined;
}) => (imageHash ? getImagePath(imageHash) : null);
