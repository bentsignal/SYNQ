import { Linking, View } from "react-native";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import {
  Button,
  FieldGroup,
  RNHostView,
  Switch,
  Text,
  Row as UIRow,
} from "@expo/ui";
import {
  accessibilityAddTraits,
  accessibilityElement,
  accessibilityLabel,
} from "@expo/ui/swift-ui/modifiers";

import type { ThemeId } from "~/features/preferences/themes";
import { SymbolIcon } from "~/components/symbol-icon";
import { track } from "~/features/analytics/analytics";
import { setPreference, usePreference } from "~/features/preferences/store";
import { THEMES } from "~/features/preferences/themes";
import { contactSupport } from "~/features/support/contact-support";
import { selectionTick } from "~/lib/haptics";
import { Row, SECONDARY_LABEL } from "./form";
import { useAppIcon } from "./use-app-icon";

const LINKS = {
  discord: "https://discord.gg/KwC24St29g",
  instagram: "https://instagram.com/bentsignal",
  review: "https://apps.apple.com/app/id6624313712?action=write-review",
  x: "https://x.com/bentsignal",
};

function Swatch({
  color,
  name,
  selected,
  onPress,
}: {
  color: string;
  name: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      variant="text"
      onPress={onPress}
      modifiers={[
        accessibilityElement("ignore"),
        accessibilityLabel(`${name} theme`),
        accessibilityAddTraits(
          selected ? ["isButton", "isSelected"] : ["isButton"],
        ),
      ]}
    >
      <RNHostView matchContents>
        <View
          className="size-[38px] items-center justify-center rounded-full border-2"
          style={{ borderColor: selected ? color : "transparent" }}
        >
          <View
            className="size-[29px] items-center justify-center rounded-full"
            style={{ backgroundColor: color }}
          >
            {selected && (
              <SymbolIcon
                name="checkmark"
                size={12}
                weight="bold"
                tintColor="#141414"
              />
            )}
          </View>
        </View>
      </RNHostView>
    </Button>
  );
}

export function AppearanceSection() {
  const router = useRouter();
  const theme = usePreference("theme");
  const appIcon = useAppIcon();
  function choose(id: ThemeId, name: string) {
    if (id === theme) return;
    selectionTick();
    track("theme_change", { theme: name });
    setPreference("theme", id);
  }
  return (
    <FieldGroup.Section title="Appearance">
      <UIRow spacing={2}>
        {THEMES.map((option) => (
          <Swatch
            key={option.id}
            color={option.accent}
            name={option.name}
            selected={theme === option.id}
            onPress={() => choose(option.id, option.name)}
          />
        ))}
      </UIRow>
      {appIcon.available && (
        <Row
          icon="app.badge"
          label="App Icon"
          onPress={() => router.push("/settings/app-icon")}
        />
      )}
    </FieldGroup.Section>
  );
}

export function PlaybackSection() {
  const haptics = usePreference("haptics");
  return (
    <FieldGroup.Section title="Playback">
      <Switch
        label="Haptics"
        value={haptics}
        onValueChange={(on) => setPreference("haptics", on)}
      />
    </FieldGroup.Section>
  );
}

export function LibrarySection() {
  const router = useRouter();
  return (
    <FieldGroup.Section title="Library">
      <Row
        icon="externaldrive"
        label="Backup & Restore"
        onPress={() => router.push("/settings/backup")}
      />
    </FieldGroup.Section>
  );
}

function openSocial(url: string) {
  track("social_press", { url });
  void Linking.openURL(url);
}

function version() {
  const name = Application.nativeApplicationVersion ?? "";
  const build = Application.nativeBuildVersion;
  return build ? `SYNQ ${name} (${build})` : `SYNQ ${name}`;
}

export function AboutSection() {
  return (
    <FieldGroup.Section title="SYNQ">
      <Row
        icon="star"
        label="Rate SYNQ"
        trailing="external"
        onPress={() => void Linking.openURL(LINKS.review)}
      />
      <Row
        icon="envelope"
        label="Contact Support"
        trailing="external"
        onPress={contactSupport}
      />
      <Row
        icon="at"
        label="X"
        trailing="external"
        onPress={() => openSocial(LINKS.x)}
      />
      <Row
        icon="camera"
        label="Instagram"
        trailing="external"
        onPress={() => openSocial(LINKS.instagram)}
      />
      <Row
        icon="bubble.left.and.bubble.right"
        label="Discord"
        trailing="external"
        onPress={() => openSocial(LINKS.discord)}
      />
      <FieldGroup.SectionFooter>
        <Text textStyle={{ color: SECONDARY_LABEL, fontSize: 13 }}>
          {version()}
        </Text>
      </FieldGroup.SectionFooter>
    </FieldGroup.Section>
  );
}
