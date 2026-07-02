export type ImportFileCommandMutation = "remove-staged-songs" | "select-files";

export const getImportFileCommandErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: ImportFileCommandMutation;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "remove-staged-songs":
      return "Selected staged songs could not be removed.";
    case "select-files":
      return "Files could not be selected.";
  }
};
