/**
 * Browser Console Logs API Endpoint
 *
 * Receives console logs from browser and writes them to a file
 * that Claude Code can read for debugging.
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { writeFile, appendFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface LogEntry {
  timestamp: number;
  level: 'log' | 'error' | 'warn' | 'info';
  args: unknown[];
}

interface LogRequest {
  logs: LogEntry[];
}

const LOG_DIR = join(process.cwd(), 'logs');
const LOG_FILE = join(LOG_DIR, 'browser-console.log');

/**
 * Format log entry for file output
 */
function formatLogEntry(entry: LogEntry): string {
  const date = new Date(entry.timestamp);
  const timestamp = date.toISOString();
  const level = entry.level.toUpperCase().padEnd(5);

  // Serialize args to string
  const message = entry.args
    .map((arg) => {
      if (typeof arg === 'string') {
        return arg;
      }
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    })
    .join(' ');

  return `[${timestamp}] ${level} ${message}\n`;
}

/**
 * POST /api/dev/logs
 * Receive and store browser console logs
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const data: LogRequest = await request.json();

    if (!data.logs || !Array.isArray(data.logs)) {
      return json({ error: 'Invalid log data' }, { status: 400 });
    }

    // Ensure log directory exists
    if (!existsSync(LOG_DIR)) {
      await mkdir(LOG_DIR, { recursive: true });
    }

    // Format all log entries
    const formattedLogs = data.logs.map(formatLogEntry).join('');

    // Append to log file
    await appendFile(LOG_FILE, formattedLogs, 'utf-8');

    return json({ success: true, count: data.logs.length });
  } catch (error) {
    console.error('Failed to write browser logs:', error);
    // Error logged, return error response
    return json({ error: 'Failed to write logs' }, { status: 500 });
  }
};

/**
 * GET /api/dev/logs
 * Retrieve recent logs (optional - for debugging)
 */
export const GET: RequestHandler = async () => {
  try {
    const { readFile } = await import('fs/promises');

    if (!existsSync(LOG_FILE)) {
      return json({ logs: [] });
    }

    const content = await readFile(LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());

    // Return last 200 lines
    const recentLines = lines.slice(-200);

    return json({ logs: recentLines });
  } catch (error) {
    console.error('Failed to read browser logs:', error);
    // Error logged, return error response
    return json({ error: 'Failed to read logs' }, { status: 500 });
  }
};

/**
 * DELETE /api/dev/logs
 * Clear the log file
 */
export const DELETE: RequestHandler = async () => {
  try {
    if (existsSync(LOG_FILE)) {
      await writeFile(LOG_FILE, '', 'utf-8');
    }

    return json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    console.error('Failed to clear browser logs:', error);
    // Error logged, return error response
    return json({ error: 'Failed to clear logs' }, { status: 500 });
  }
};
