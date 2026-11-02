/** How many albums the prompt names before saying how many more. */
const NAMED = 3;

function quoted(names: readonly string[]) {
  return names.map((name) => `“${name}”`);
}

function listed(names: readonly string[]) {
  const shown = quoted(names.slice(0, NAMED));
  const more = names.length - shown.length;
  if (more > 0) return `${shown.join(", ")}, and ${more} more`;
  if (shown.length <= 2) return shown.join(" and ");
  return `${shown.slice(0, -1).join(", ")}, and ${shown.at(-1)}`;
}

/** The words of the alert offering to delete albums an edit just emptied. */
export function emptyAlbumPrompt(names: readonly string[]) {
  return names.length === 1
    ? {
        message: `${listed(names)} has no songs left.`,
        title: "Delete Empty Album?",
      }
    : {
        message: `${listed(names)} have no songs left.`,
        title: `Delete ${names.length} Empty Albums?`,
      };
}
