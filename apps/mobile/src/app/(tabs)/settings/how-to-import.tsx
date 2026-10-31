import type { ImageSourcePropType } from "react-native";
import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { Stack } from "expo-router";

import destinationFolder from "../../../../assets/images/how-to-import/destination-folder.jpg";
import localFilesEnable from "../../../../assets/images/how-to-import/local-files-enable.jpg";
import localFilesPlaylist from "../../../../assets/images/how-to-import/local-files-playlist.jpg";
import saveInstructions2 from "../../../../assets/images/how-to-import/save-instructions-2.jpg";
import saveInstructions from "../../../../assets/images/how-to-import/save-instructions.jpg";

/** One step: a title, where to go, and 2.5.2's screenshot of it. */
function Step({
  title,
  path,
  image,
  aspectRatio,
}: {
  title: string;
  path?: string;
  image: ImageSourcePropType;
  aspectRatio: number;
}) {
  return (
    <View className="gap-2">
      <Text className="text-headline text-foreground font-semibold">{title}</Text>
      {path !== undefined && (
        <Text className="text-subhead text-muted">{path}</Text>
      )}
      <Image
        source={image}
        style={{ aspectRatio, borderRadius: 12, width: "100%" }}
        contentFit="contain"
        transition={150}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-5">
      <Text className="text-title text-foreground font-bold">{title}</Text>
      {children}
    </View>
  );
}

/**
 * 2.5.2's import instructions: listening to SYNQ's music in Spotify through
 * its Local Files, exporting from SYNQ into Spotify's folder, and how
 * Wi-Fi Transfer works.
 */
export default function HowToImportScreen() {
  return (
    <>
      <Stack.Screen
        options={{ headerLargeTitleEnabled: false, title: "How to Import" }}
      />
      <ScrollView
        className="bg-background flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-12 px-5 pt-4 pb-16"
      >
        <Section title="Spotify Setup">
          <Step
            title="1. Turn on Local Files in Spotify"
            path="Spotify → Settings → Local Files"
            image={localFilesEnable}
            aspectRatio={1179 / 674}
          />
          <Step
            title="2. Save your music to Spotify's folder"
            path="On My iPhone → Spotify"
            image={destinationFolder}
            aspectRatio={1179 / 1020}
          />
          <Step
            title="3. Listen in Spotify"
            path="Playlists → Local Files"
            image={localFilesPlaylist}
            aspectRatio={794 / 804}
          />
        </Section>
        <Section title="Exporting to Spotify">
          <Step
            title={"1. Share a song, then tap “Save to Files”"}
            image={saveInstructions}
            aspectRatio={1179 / 1313}
          />
          <Step
            title="2. Choose Spotify's folder and tap Save"
            path="On My iPhone → Spotify"
            image={saveInstructions2}
            aspectRatio={1179 / 1089}
          />
        </Section>
        <Section title="Wi-Fi Transfer">
          <Text className="text-body text-muted leading-6">
            Wi-Fi Transfer runs a small web server inside SYNQ while its screen
            is open. Only devices on your Wi-Fi can reach it. Type the address
            it shows into a browser on your computer, choose your music, and it
            goes straight to your iPhone over your network, never the internet.
          </Text>
        </Section>
      </ScrollView>
    </>
  );
}
