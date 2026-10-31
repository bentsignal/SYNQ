import { router } from "expo-router";

/** Opens an import flow (docs/ui.md → Import): the Files picker or Wi-Fi Transfer. */
export function openImport(kind: "files" | "wifi") {
  router.push(kind === "files" ? "/import/files" : "/import/wifi");
}
