import { Text } from "react-native";
import { Stack } from "expo-router";
import { useCSSVariable } from "uniwind";

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
 * always in view. The bar is solid in the background's color, so content
 * scrolls behind the title instead of colliding with it. Pushed screens
 * keep `TabTitle`: their top left is Back.
 */
export function RootTabTitle({ title }: { title: string }) {
  const background = useCSSVariable("--color-background");
  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitleEnabled: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor:
              typeof background === "string" ? background : undefined,
          },
          headerTitle: "",
          headerTransparent: false,
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
