import type { ImageSourcePropType } from "react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { Stack } from "expo-router";

import type { AppIconName } from "~/features/app-icon/app-icon";
import { SymbolIcon } from "~/components/symbol-icon";
import { APP_ICONS } from "~/features/app-icon/app-icon";
import { chooseAppIcon, useAppIcon } from "~/features/settings/use-app-icon";
import { cn } from "~/lib/cn";
import blue from "../../../../assets/icons/icon-blue.png";
import mint from "../../../../assets/icons/icon-mint.png";
import orange from "../../../../assets/icons/icon-orange.png";
import pink from "../../../../assets/icons/icon-pink.png";
import purple from "../../../../assets/icons/icon-purple.png";
import red from "../../../../assets/icons/icon-red.png";
import yellow from "../../../../assets/icons/icon-yellow.png";

const PREVIEWS = {
  "icon-blue": blue,
  "icon-mint": mint,
  "icon-orange": orange,
  "icon-pink": pink,
  "icon-purple": purple,
  "icon-red": red,
  "icon-yellow": yellow,
} as const satisfies Record<AppIconName, ImageSourcePropType>;

const SIZE = 76;

function IconChoice({
  name,
  label,
  selected,
  onPress,
}: {
  name: AppIconName;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} app icon`}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="w-1/3 items-center gap-2 py-3"
    >
      <View>
        <Image
          source={PREVIEWS[name]}
          style={{
            borderRadius: SIZE * 0.2237,
            height: SIZE,
            width: SIZE,
          }}
          accessibilityIgnoresInvertColors
        />
        {selected && (
          <View className="bg-accent border-background absolute -right-1.5 -bottom-1.5 size-6 items-center justify-center rounded-full border-2">
            <SymbolIcon
              name="checkmark"
              size={11}
              weight="bold"
              tintColor="#141414"
            />
          </View>
        )}
      </View>
      <Text
        className={cn(
          "text-footnote",
          selected ? "text-foreground font-semibold" : "text-muted",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function IconGrid() {
  const { current } = useAppIcon();
  return (
    <View className="flex-row flex-wrap px-4 pt-4">
      {APP_ICONS.map((icon) => (
        <IconChoice
          key={icon.name}
          name={icon.name}
          label={icon.label}
          selected={current === icon.name}
          onPress={() => chooseAppIcon(icon.name)}
        />
      ))}
    </View>
  );
}

/** The seven 2.5.2 icons, the current one checked. */
export default function AppIconScreen() {
  return (
    <>
      <Stack.Screen
        options={{ headerLargeTitleEnabled: false, title: "App Icon" }}
      />
      <ScrollView
        className="bg-background flex-1"
        contentInsetAdjustmentBehavior="automatic"
      >
        <IconGrid />
      </ScrollView>
    </>
  );
}
