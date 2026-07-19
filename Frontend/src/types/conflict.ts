export type ConflictSeverity = "blocking" | "warning" | "informational";

export interface Conflict {
  id: string;
  /**
   * Extensible per Backend/API_CONTRACT.md — treat as an open string, not a
   * fixed union. Drive all display purely off `severity`, never off `type`.
   */
  type: string;
  severity: ConflictSeverity;
  message: string;
  affectedEntries: string[];
}

export interface ConflictCheckResult {
  conflicts: Conflict[];
  summary: Record<ConflictSeverity, number>;
}
