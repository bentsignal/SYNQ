export const getPlaybackQueueActionState = ({
  queueLength,
}: {
  queueLength: number;
}) => ({
  canClearQueue: queueLength > 0,
});
