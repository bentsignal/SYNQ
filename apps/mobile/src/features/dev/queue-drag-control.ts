type Drive = (index: number, toY: number, ms: number, holdMs: number) => void;

const control = { drive: asDrive(null) };

function asDrive(drive: Drive | null) {
  return drive;
}

/** The open queue's drag, or null to let go of it (`QueueDragDriver`). */
export function setQueueDrive(drive: Drive | null) {
  control.drive = drive;
}

/**
 * `synqDev.player.drag(index, toY, ms, holdMs)` runs a real queue drag from
 * the UI thread: see `queue-drag-driver.tsx`.
 */
export function driveQueueDrag(
  index: number,
  toY: number,
  ms: number,
  holdMs = 0,
) {
  control.drive?.(index, toY, ms, holdMs);
}
