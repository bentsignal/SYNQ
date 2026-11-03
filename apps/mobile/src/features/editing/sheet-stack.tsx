import { Stack } from "expo-router";
import { useCSSVariable } from "uniwind";

/**
 * The stack inside an edit sheet: the form, then the lists it pushes.
 * The bar is transparent so the form's background runs up under it, and
 * the stack's background is the sheet's, under lists shorter than it.
 */
export function SheetStack() {
  // The color SwiftUI gives a sheet's form, so its pushed lists match.
  const elevated = useCSSVariable("--color-background-elevated");
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: typeof elevated === "string" ? elevated : undefined,
        },
        headerBackButtonDisplayMode: "minimal",
        headerTransparent: true,
      }}
    />
  );
}
