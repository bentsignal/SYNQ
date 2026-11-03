import { useRef, useState } from "react";
import { FieldGroup } from "@expo/ui";

import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { SheetToolbar } from "./sheet-toolbar";

/**
 * A small sheet that names something new (docs/ui.md → New Playlist /
 * Album / Artist): one field, focused, and Done. `onSave` returns false
 * when it couldn't save (it says why), which keeps the sheet up.
 */
export function NameSheet({
  title,
  placeholder,
  onCancel,
  onSave,
}: {
  title: string;
  placeholder: string;
  onCancel: () => void;
  onSave: (name: string) => boolean;
}) {
  const [name, setName] = useState("");
  // Saving closes the sheet; a second tap must not make another.
  const saved = useRef(false);
  function save() {
    if (saved.current || name.trim() === "") return;
    saved.current = onSave(name.trim());
  }
  return (
    <>
      <SheetToolbar
        title={title}
        canSave={name.trim() !== ""}
        onCancel={onCancel}
        onDone={save}
      />
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup>
          <FieldGroup.Section>
            <TextInput
              autoFocus
              autoCapitalize="words"
              placeholder={placeholder}
              enterKeyHint="done"
              onChangeText={setName}
              onSubmitEditing={save}
            />
          </FieldGroup.Section>
        </FieldGroup>
      </NativeHost>
    </>
  );
}
