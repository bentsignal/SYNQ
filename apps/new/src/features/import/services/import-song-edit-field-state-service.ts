export const getImportSongEditFieldState = () =>
  ({
    album: {
      label: "Album",
      placeholder: "Album",
      returnKeyType: "next",
    },
    artist: {
      label: "Artist",
      placeholder: "Artist",
      returnKeyType: "next",
    },
    title: {
      label: "Title",
      placeholder: "Song title",
      returnKeyType: "next",
    },
    track: {
      label: "Track",
      placeholder: "Track number",
      returnKeyType: "done",
    },
  }) as const;
