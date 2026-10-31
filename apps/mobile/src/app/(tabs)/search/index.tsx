import { Stack, useFocusEffect } from "expo-router";

import { ScreenScroll } from "~/components/screen-scroll";
import {
  blurNativeSearch,
  focusNativeSearch,
  nativeSearchBarRef,
} from "~/features/search/native-search";
import { useSearchText } from "~/features/search/use-search-query";

export default function SearchScreen() {
  const { onChangeText } = useSearchText();

  // Selecting the tab opens the search field over the keyboard. The frame
  // waits for the native search bar to attach on the first visit.
  useFocusEffect(() => {
    const frame = requestAnimationFrame(focusNativeSearch);
    return () => {
      cancelAnimationFrame(frame);
      blurNativeSearch();
    };
  });

  return (
    <>
      <Stack.Title>Search</Stack.Title>
      <Stack.SearchBar
        ref={nativeSearchBarRef}
        placeholder="Songs, artists, albums, playlists"
        hideWhenScrolling={false}
        obscureBackground={false}
        placement="automatic"
        onChangeText={(event) => onChangeText(event.nativeEvent.text)}
      />
      <ScreenScroll />
    </>
  );
}
