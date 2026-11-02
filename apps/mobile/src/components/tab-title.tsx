import { Text } from "react-native";
import { Stack } from "expo-router";

/**
 * A tab's native large title: it starts big at the top left, scrolls with
 * the content, and hands off to the small centered title in the glass bar
 * once it scrolls past (the tab stack enables large titles).
 */
export function TabTitle({ title }: { title: string }) {
  return (
    <Stack.Screen
      options={{ headerLargeTitleEnabled: true, headerTitle: title, title }}
    />
  );
}

/**
 * A root tab's title, on the bar's own row: left-aligned opposite the
 * toolbar's buttons, so the row isn't half empty above a large title, and
 * always in view. The bar is transparent, so at the top of the page there's
 * no bar to see. `HeaderGlass`, with the page, fades in dark glass ending in a
 * hairline once content scrolls under it, which keeps the title readable over
 * bright artwork (docs/ui.md → Library). Pushed screens keep `TabTitle`: their
 * top left is Back.
 */
export function RootTabTitle({ title }: { title: string }) {
  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitleEnabled: false,
          headerShadowVisible: false,
          headerTitle: "",
          headerTransparent: true,
          title,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.View hidesSharedBackground>
          <Text
            accessibilityRole="header"
            className="text-foreground text-[30px] font-bold"
          >
            {title}
          </Text>
        </Stack.Toolbar.View>
      </Stack.Toolbar>
    </>
  );
}
