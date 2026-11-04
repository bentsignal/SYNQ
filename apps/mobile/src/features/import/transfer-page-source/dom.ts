/** The elements `index.html` gives an id, as the script uses them. */
interface PageElements {
  cancel: HTMLButtonElement;
  favicon: HTMLLinkElement;
  files: HTMLInputElement;
  fill: HTMLElement;
  line: HTMLElement;
  live: HTMLElement;
  name: HTMLElement;
  problems: HTMLDetailsElement;
  "problems-count": HTMLElement;
  "problems-list": HTMLElement;
  status: HTMLElement;
}

export const root = document.documentElement;

export function el<Id extends keyof PageElements>(id: Id) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- The script loads after these elements, and the tests fail on an id index.html doesn't have.
  return document.getElementById(id) as PageElements[Id];
}

export function flag(key: string, on: boolean) {
  if (on) root.dataset[key] = "";
  else delete root.dataset[key];
}
