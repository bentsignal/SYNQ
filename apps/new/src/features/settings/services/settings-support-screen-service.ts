import {
  getSettingsBackLink,
  getSupportActionKey,
  supportActions,
} from "./settings-navigation-service";

export const getSupportScreenViewState = () => ({
  backLink: getSettingsBackLink(),
  bugReportPanel: {
    body:
      "Include your device model, iOS or Android version, what you tapped before the issue, and whether the song file lives locally on-device.",
    title: "Before you send a bug",
  },
  header: {
    kicker: "Help",
    subtitle: "Get help, send feedback, or follow along with the project.",
    title: "Support",
  },
});

export const getSupportScreenControllerViewState = () => ({
  actionRows: supportActions.map((action) => ({
    ...action,
    key: getSupportActionKey(action),
  })),
  viewState: getSupportScreenViewState(),
});
