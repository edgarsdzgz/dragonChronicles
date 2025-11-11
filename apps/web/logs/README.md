# Browser Console Logs

This directory contains browser console logs captured for debugging purposes.

## Files

- **browser-console.log** - All browser console.log, console.error, console.warn, console.info outputs

## How It Works

1. **Console Interceptor** (`src/lib/debug/console-interceptor.ts`) - Captures all console methods in the browser
2. **API Endpoint** (`src/routes/api/dev/logs/+server.ts`) - Receives logs from browser and writes to file
3. **Auto-initialization** (`src/routes/+layout.svelte`) - Starts on app mount

## Usage

### For Claude Code

Simply read the log file:

```bash
Read apps/web/logs/browser-console.log
```

### Clearing Logs

Delete or clear the file manually, or use the API:

```bash
# Via API
curl -X DELETE http://localhost:5173/api/dev/logs
```

### Viewing Logs

```bash
# Read entire file
cat apps/web/logs/browser-console.log

# Follow logs in real-time (like tail -f)
Get-Content -Path apps/web/logs/browser-console.log -Wait
```

## Log Format

```
[2025-01-30T12:34:56.789Z] LOG   Message here
[2025-01-30T12:34:56.790Z] ERROR Error message
[2025-01-30T12:34:56.791Z] WARN  Warning message
```

## Notes

- Logs are batched and sent every 2 seconds or when buffer reaches 50 entries
- Original console output is preserved (logs appear in browser console AND file)
- This directory is git-ignored
