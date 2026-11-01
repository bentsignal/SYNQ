import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";

import { track } from "~/features/analytics/analytics";
import { ImportList } from "~/features/import/import-list";
import {
  endImportSession,
  startImportSession,
} from "~/features/import/session";

/**
 * Import from Files: the sheet opens, the Files picker comes up over it
 * (`pickIntoImport`, once the sheet has presented), and the picked songs
 * are read and imported as the sheet lists them. Cancelling the picker
 * closes the sheet.
 */
export default function ImportFilesScreen() {
  const router = useRouter();

  // eslint-disable-next-line no-restricted-syntax -- The batch lives exactly as long as this sheet, and ends however the sheet closes.
  useEffect(() => {
    startImportSession("files");
    track("import_files");
    return endImportSession;
  }, []);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="checkmark"
          accessibilityLabel="Done"
          variant="prominent"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <ImportList />
    </>
  );
}
