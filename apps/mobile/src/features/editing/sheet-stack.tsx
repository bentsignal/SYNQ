import { Stack } from "expo-router";

/**
 * The stack inside an edit sheet: the form, then the lists it pushes.
 * The bar is transparent so the form's background runs up under it.
 */
export function SheetStack() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerTransparent: true,
      }}
    />
  );
}
