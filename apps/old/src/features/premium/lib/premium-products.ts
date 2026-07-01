const productNames = [
  "Premium Monthly",
  "Premium Yearly",
  "Premium Lifetime",
] as const;

export const getPremiumProductName = (selected: number) => {
  const productName = productNames[selected];
  if (!productName) {
    throw new Error("Invalid purchase option");
  }

  return productName;
};

export const getPremiumRestoreMessage = (name: string) => {
  if (name === "SYNQPremiumMonthly") {
    return "Successfully restored your monthly subscription.";
  }
  if (name === "SYNQPremiumYearly") {
    return "Successfully restored your yearly subscription.";
  }
  if (name === "SYNQPremiumLifetime") {
    return "Successfully restored your lifetime subscription.";
  }

  return "Successfully restored your purchase.";
};

export const getSelectedPremiumTierFromProduct = (name: string) => {
  if (name === "SYNQPremiumMonthly") {
    return 0;
  }
  if (name === "SYNQPremiumYearly") {
    return 1;
  }
  if (name === "SYNQPremiumLifetime") {
    return 2;
  }

  return undefined;
};
