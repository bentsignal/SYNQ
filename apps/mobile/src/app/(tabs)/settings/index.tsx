import { TabTitle } from "~/components/tab-title";
import { Form } from "~/features/settings/form";
import {
  AboutSection,
  AppearanceSection,
  LibrarySection,
  PlaybackSection,
  PremiumSection,
} from "~/features/settings/sections";

export default function SettingsScreen() {
  return (
    <>
      <TabTitle title="Settings" />
      <Form>
        <PremiumSection />
        <AppearanceSection />
        <PlaybackSection />
        <LibrarySection />
        <AboutSection />
      </Form>
    </>
  );
}
