export type PremiumMutationKind =
  | "check-entitlement"
  | "purchase-tier"
  | "restore-purchase";

export const getPremiumMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: PremiumMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "check-entitlement":
      return "Premium entitlement could not be checked.";
    case "purchase-tier":
      return "Premium purchase failed.";
    case "restore-purchase":
      return "Premium restore failed.";
  }
};
