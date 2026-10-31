import type { PremiumStatus } from "~/features/premium/status";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

/** "Yearly · Renews Oct 31, 2027", "Lifetime". */
export function planDetail(status: PremiumStatus) {
  if (status.plan === "lifetime") return "Lifetime";
  const plan =
    status.plan === "monthly"
      ? "Monthly"
      : status.plan === "yearly"
        ? "Yearly"
        : null;
  const until =
    status.expiresAt === null
      ? null
      : `${status.willRenew ? "Renews" : "Ends"} ${dateFormat.format(status.expiresAt)}`;
  return [plan, until].filter(Boolean).join(" · ") || "Active";
}
