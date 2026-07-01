import { posthog } from "@/src/lib/posthog";

export const captureAppIconChange = (icon: string) => {
  posthog.capture("app_icon_change", {
    icon,
  });
};

export const captureThemeChange = (theme: string) => {
  posthog.capture("theme_change", {
    theme,
  });
};

export const captureSettingsPremiumPress = (premium: boolean) => {
  posthog.capture("check_premium", {
    premium,
  });
};

export const captureSocialPress = (url: string) => {
  posthog.capture("social_press", {
    url,
  });
};
