export type BackupOperation = "backup" | "erase" | "restore";

export type BackupPhase = "failure" | "idle" | "running" | "success";

export type BackupSessionState = {
  error: string | null;
  lastOperation: BackupOperation | null;
  message: string | null;
  phase: BackupPhase;
  requiresPremium: boolean;
};

export type BackupCommandResult = {
  message: string;
  operation: BackupOperation;
};
