// A search settling must leave the keyboard up. The Search tab's focus effect
// blurs the field in its cleanup, so if the effect's function changes when the
// query does, every settled search closes the keyboard. Only a device shows
// the keyboard itself; this catches the effect re-running, with the React
// Compiler on as it is in the app.
import type { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react-native";

import SearchScreen from "~/features/library/screens/search-screen";
import { SEARCH_DELAY_MS } from "~/features/search/debounce";
import {
  blurNativeSearch,
  focusNativeSearch,
} from "~/features/search/native-search";
import { queryClient } from "~/lib/query-client";

interface SearchBarProps {
  onChangeText: (event: { nativeEvent: { text: string } }) => void;
  onCancelButtonPress: () => void;
}

let mockSearchBar: SearchBarProps | undefined;

jest.mock("expo-router", () => ({
  Stack: {
    SearchBar: (props: SearchBarProps) => {
      mockSearchBar = props;
      return null;
    },
    Title: () => null,
  },
  // As the real one: cleans up and runs again when the function changes.
  useFocusEffect: (effect: () => () => void) => {
    jest
      .requireActual<{ useEffect: typeof useEffect }>("react")
      .useEffect(effect, [effect]);
  },
  useIsFocused: () => true,
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("~/features/search/native-search", () => ({
  blurNativeSearch: jest.fn(),
  focusNativeSearch: jest.fn(),
  nativeSearchBarRef: { current: null },
}));

jest.mock("@synq/db", () => ({
  ...jest.requireActual<object>("@synq/db"),
  searchLibrary: () => ({ albums: [], artists: [], playlists: [], songs: [] }),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

function renderScreen() {
  return render(
    <QueryClientProvider client={queryClient}>
      <SearchScreen />
    </QueryClientProvider>,
  );
}

async function type(text: string) {
  await act(async () => {
    mockSearchBar?.onChangeText({ nativeEvent: { text } });
    await jest.advanceTimersByTimeAsync(SEARCH_DELAY_MS + 1);
  });
}

test("a settled search doesn't blur the search field", async () => {
  await renderScreen();
  await type("a");
  await type("ab");
  expect(blurNativeSearch).not.toHaveBeenCalled();
});

test("clearing the field keeps it focused", async () => {
  await renderScreen();
  await act(() => jest.advanceTimersByTimeAsync(20));
  expect(focusNativeSearch).toHaveBeenCalledTimes(1);
  await type("a");
  await type("");
  expect(blurNativeSearch).not.toHaveBeenCalled();
});

test("leaving the screen blurs the field", async () => {
  const screen = await renderScreen();
  await type("a");
  await screen.unmount();
  expect(blurNativeSearch).toHaveBeenCalledTimes(1);
});
