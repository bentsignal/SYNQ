export type ImportSessionCommandMutation =
  | "begin-wifi-transfer"
  | "discard-session"
  | "save-session";

export const getImportSessionCommandErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: ImportSessionCommandMutation;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "begin-wifi-transfer":
      return "Wi-Fi import cache could not be prepared.";
    case "discard-session":
      return "Import session could not be discarded.";
    case "save-session":
      return "Import session could not be saved.";
  }
};
