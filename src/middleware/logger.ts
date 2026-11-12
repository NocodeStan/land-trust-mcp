import type { Request, Response, NextFunction } from "express";

/**
 * Request logger.
 *
 * Retention policy: in-memory only (resets on restart).
 * No IP addresses are logged.
 * No query text or tool arguments are logged.
 * Only method, path, status, and timestamp are recorded.
 */

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status?: number;
}

const MAX_ENTRIES = 10_000;
const entries: LogEntry[] = [];

function pruneOldEntries(): void {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
  let i = 0;
  while (i < entries.length) {
    if (new Date(entries[i].timestamp).getTime() < cutoff) {
      i++;
    } else {
      break;
    }
  }
  if (i > 0) entries.splice(0, i);

  // Also cap total size
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES);
  }
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
  };

  res.on("finish", () => {
    entry.status = res.statusCode;
    pruneOldEntries();
    entries.push(entry);
  });

  next();
}

/** Returns a snapshot of recent log entries (for health/metrics endpoints). */
export function getRecentEntries(): readonly LogEntry[] {
  pruneOldEntries();
  return entries.slice(-100);
}
