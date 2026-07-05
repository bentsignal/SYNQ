export type SupportAction =
  | {
      description: string;
      label: string;
      type: "review";
    }
  | {
      description: string;
      label: string;
      type: "url";
      url: string;
    };

export type SupportUrlAction = Extract<SupportAction, { type: "url" }>;

export const getSupportActionKey = (action: SupportAction) =>
  action.type === "url" ? action.url : action.type;

export const supportReviewAction: SupportAction = {
  description: "Open the App Store review prompt when it is available.",
  label: "Leave a Review",
  type: "review",
};

const supportUrlAction = ({
  description,
  label,
  url,
}: {
  description: string;
  label: string;
  url: string;
}): SupportUrlAction => ({
  description,
  label,
  type: "url",
  url,
});

export const supportActions: SupportAction[] = [
  supportReviewAction,
  supportUrlAction({
    description: "Open the SYNQ support page in your browser.",
    label: "Contact Support",
    url: "https://directedbyshawn.com/synq-support",
  }),
  supportUrlAction({
    description: "Follow project updates and release notes.",
    label: "X",
    url: "https://x.com/SYNQ_cc",
  }),
  supportUrlAction({
    description: "See design and app progress posts.",
    label: "Instagram",
    url: "https://instagram.com/synq.cc",
  }),
  supportUrlAction({
    description: "Join the community and report issues directly.",
    label: "Discord",
    url: "https://discord.gg/KwC24St29g",
  }),
];
