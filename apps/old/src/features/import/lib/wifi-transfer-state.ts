type BeginWifiTransferInput = {
  setExportDisabled: (disabled: boolean) => void;
  setLoadAnimInProgress: (inProgress: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTransferProgress: (progress: number) => void;
  setTransferSize: (size: number) => void;
  size: number | string;
};

type FinishWifiTransferInput = Omit<BeginWifiTransferInput, "size">;

export function beginWifiTransfer({
  setExportDisabled,
  setLoadAnimInProgress,
  setLoading,
  setTransferProgress,
  setTransferSize,
  size,
}: BeginWifiTransferInput) {
  const transferSize = Number(size);

  if (transferSize > 2) {
    setLoadAnimInProgress(true);
  }
  setTransferSize(transferSize);
  setTransferProgress(0);
  setLoading(true);
  setExportDisabled(true);
}

export function finishWifiTransfer({
  setExportDisabled,
  setLoadAnimInProgress,
  setLoading,
  setTransferProgress,
  setTransferSize,
}: FinishWifiTransferInput) {
  setLoading(false);
  setExportDisabled(false);
  setTransferSize(0);
  setTransferProgress(0);
  setLoadAnimInProgress(false);
}
