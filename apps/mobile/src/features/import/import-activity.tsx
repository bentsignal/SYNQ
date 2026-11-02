import { Image, ProgressView, Text } from "@expo/ui/swift-ui";
import {
  animation,
  Animation,
  contentTransition,
  controlSize,
  font,
  foregroundStyle,
  monospacedDigit,
} from "@expo/ui/swift-ui/modifiers";

import type { ImportState } from "./queue";
import { FloatingCapsule } from "~/components/floating-capsule";
import { SECONDARY_LABEL } from "~/features/settings/form";
import { capsuleLine, finishedLine, isBatchActive } from "./progress";
import { useImportState } from "./session";

/** The line to show, or null while there's nothing to say. */
export function activityLine({
  batch,
  finished,
  shown,
  transfer,
}: ImportState) {
  if (finished) return finishedLine(batch.imported);
  if (!isBatchActive(batch, transfer)) return null;
  // Nothing to count yet, as when an upload broke off with none arrived.
  return shown.total === 0 ? null : capsuleLine(shown);
}

function isFinished({ finished }: ImportState) {
  return finished;
}

/** What the line's numbers animate on. */
function shownDone({ shown }: ImportState) {
  return shown.done;
}

/**
 * A small capsule floating above the mini player while a batch imports in
 * the background, from Files or Wi-Fi: on every tab, passing touches through,
 * and gone a moment after the batch is. It floats over the screen, so it
 * can't move anything. Its count follows the batch at its own pace
 * (`stepCapsule`), so files flying through don't make the numbers flicker.
 */
export function ImportActivity() {
  const line = useImportState(activityLine);
  const finished = useImportState(isFinished);
  const done = useImportState(shownDone);
  if (line === null) return null;
  return (
    <FloatingCapsule>
      {finished ? (
        <Image systemName="checkmark" size={12} color={SECONDARY_LABEL} />
      ) : (
        <ProgressView modifiers={[controlSize("small")]} />
      )}
      <Text
        modifiers={[
          font({ size: 13, weight: "medium" }),
          monospacedDigit(),
          foregroundStyle("#ffffff"),
          contentTransition("numericText"),
          animation(Animation.default, done),
        ]}
      >
        {line}
      </Text>
    </FloatingCapsule>
  );
}
