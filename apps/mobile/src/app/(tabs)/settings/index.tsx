import { TabTitle } from "~/components/tab-title";
import { Form } from "~/features/settings/form";
import {
  AboutSection,
  AppearanceSection,
  LibrarySection,
  PlaybackSection,
} from "~/features/settings/sections";

export default function SettingsScreen() {
  return (
    <>
      <TabTitle title="Settings" />
      <Form>
        <AppearanceSection />
        <PlaybackSection />
        <LibrarySection />
        <AboutSection />
      </Form>
    </>
  );
}
