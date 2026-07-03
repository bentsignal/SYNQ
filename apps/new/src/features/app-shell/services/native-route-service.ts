import { router, type Href } from "expo-router";

export const pushNativeRoute = (href: Href) => {
  router.push(href);
};

export const replaceNativeRoute = (href: Href) => {
  router.replace(href);
};
