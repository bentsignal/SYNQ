export const getLibrarySongEditFieldState = () =>
  ({
    albumNames: {
      label: "Albums",
      placeholder: "Album names",
      returnKeyType: "done",
    },
    artistNames: {
      label: "Artists",
      placeholder: "Artist names",
      returnKeyType: "next",
    },
    title: {
      label: "Title",
      placeholder: "Song title",
      returnKeyType: "next",
    },
  }) as const;
