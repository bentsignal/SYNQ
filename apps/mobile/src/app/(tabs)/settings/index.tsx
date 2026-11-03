import { RootTabTitle } from "~/components/tab-title";
import { RootTabForm } from "~/features/settings/form";
import {
  AboutSection,
  AppearanceSection,
  LibrarySection,
  PlaybackSection,
} from "~/features/settings/sections";

export default function SettingsScreen() {
  return (
    <>
      <RootTabTitle title="Settings" />
      <RootTabForm>
        <AppearanceSection />
        <PlaybackSection />
        <LibrarySection />
        <AboutSection />
      </RootTabForm>
    </>
  );
}
