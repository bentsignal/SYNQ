export type HomeGuideSection = {
  body: string;
  steps: string[];
  title: string;
};

export const getHomeGuideSections = (): HomeGuideSection[] => [
  {
    body: "Prepare Spotify so exported SYNQ tracks appear as local files.",
    steps: [
      "Enable Local Files in Spotify settings.",
      "Save exported songs to On My iPhone / Spotify.",
      "Open Spotify, then play them from Playlists / Local Files.",
    ],
    title: "Spotify Setup",
  },
  {
    body: "Use the export action when you want to hand songs back to Files.",
    steps: [
      "Choose Save to Files from the share sheet.",
      "Select the Spotify folder as the destination.",
      "Return to Spotify after the files finish saving.",
    ],
    title: "Export Flow",
  },
  {
    body: "Wi-Fi import runs a temporary local web server on this device.",
    steps: [
      "Open the Wi-Fi import screen while both devices are on the same network.",
      "Enter the displayed address in a desktop browser.",
      "Upload audio files directly over the local network.",
    ],
    title: "Network Transfer",
  },
];
