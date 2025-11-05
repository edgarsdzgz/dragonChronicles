#!/usr/bin/env bash

# Windows 10 System Monitor & Diagnostic Script
# Monitors system resources and checks Windows logs for freeze-related issues
#
# Usage: ./windows-system-monitor.sh [--log] [--duration SECONDS]
#   --log: Write output to monitor.log file
#   --duration: How long to monitor (default: 60 seconds)

set -euo pipefail

# Configuration
MONITOR_INTERVAL=5  # seconds between checks
DURATION=${DURATION:-60}
LOG_FILE="monitor.log"
ENABLE_LOG=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --log)
      ENABLE_LOG=true
      shift
      ;;
    --duration)
      DURATION="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--log] [--duration SECONDS]"
      exit 1
      ;;
  esac
done

# Log function
log() {
  local msg="$1"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $msg"
  if [[ "$ENABLE_LOG" == true ]]; then
    echo "[$timestamp] $msg" >> "$LOG_FILE"
  fi
}

# Check if running in Git Bash (Windows)
if ! command -v wmic &> /dev/null && ! command -v powershell &> /dev/null; then
  echo "Error: This script requires Windows commands (wmic or powershell)"
  echo "Please run from Git Bash or Windows Subsystem for Linux with Windows tools"
  exit 1
fi

log "=== Windows System Monitor Started ==="
log "Monitoring for ${DURATION} seconds (interval: ${MONITOR_INTERVAL}s)"
log "Press Ctrl+C to stop early"
echo ""

# Function to get CPU usage using PowerShell
get_cpu_usage() {
  if command -v powershell &> /dev/null; then
    powershell -Command "Get-Counter '\Processor(_Total)\% Processor Time' | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue"
  elif command -v wmic &> /dev/null; then
    wmic cpu get loadpercentage 2>/dev/null | tail -1 | tr -d ' '
  else
    echo "N/A"
  fi
}

# Function to get memory usage
get_memory_info() {
  if command -v powershell &> /dev/null; then
    powershell -Command "\$mem = Get-CimInstance Win32_OperatingSystem; [math]::Round((\$mem.TotalVisibleMemorySize - \$mem.FreePhysicalMemory) * 100 / \$mem.TotalVisibleMemorySize, 1)"
  elif command -v wmic &> /dev/null; then
    wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:list 2>/dev/null | grep -E "TotalVisibleMemorySize|FreePhysicalMemory" | awk -F'=' '{print $2}' | {
      read total
      read free
      if [[ -n "$total" && -n "$free" ]]; then
        awk "BEGIN {printf \"%.1f\", ($total - $free) * 100 / $total}"
      else
        echo "N/A"
      fi
    }
  else
    echo "N/A"
  fi
}

# Function to get disk usage
get_disk_usage() {
  local drive="${1:-C:}"
  if command -v powershell &> /dev/null; then
    powershell -Command "\$disk = Get-PSDrive $drive; [math]::Round((\$disk.Used / (\$disk.Used + \$disk.Free)) * 100, 1)" 2>/dev/null || echo "N/A"
  else
    df -h "$drive" 2>/dev/null | tail -1 | awk '{print $5}' | sed 's/%//' || echo "N/A"
  fi
}

# Function to check Windows Event Viewer for critical errors
check_event_log() {
  local minutes_back="${1:-5}"
  if command -v powershell &> /dev/null; then
    powershell -Command "\$time = (Get-Date).AddMinutes(-$minutes_back); Get-EventLog -LogName System -After \$time -EntryType Error,Critical -Newest 5 | Select-Object TimeGenerated, Source, EntryType, Message | Format-List" 2>/dev/null || echo "Unable to access Event Log"
  else
    echo "Event Log check requires PowerShell"
  fi
}

# Function to get top processes by CPU
get_top_processes() {
  if command -v powershell &> /dev/null; then
    powershell -Command "Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 ProcessName, CPU, WorkingSet | Format-Table -AutoSize" 2>/dev/null | head -10
  else
    echo "Process listing requires PowerShell"
  fi
}

# Main monitoring loop
START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION))
ITERATION=0

while [[ $(date +%s) -lt $END_TIME ]]; do
  ITERATION=$((ITERATION + 1))
  CURRENT_TIME=$(date '+%H:%M:%S')
  
  log "--- Iteration $ITERATION ($CURRENT_TIME) ---"
  
  # System metrics
  CPU_USAGE=$(get_cpu_usage)
  MEM_USAGE=$(get_memory_info)
  DISK_USAGE=$(get_disk_usage)
  
  log "CPU Usage: ${CPU_USAGE}%"
  log "Memory Usage: ${MEM_USAGE}%"
  log "Disk Usage (C:): ${DISK_USAGE}%"
  
  # Check for high resource usage
  if [[ "$CPU_USAGE" != "N/A" ]] && (( $(echo "$CPU_USAGE > 90" | bc -l 2>/dev/null || echo 0) )); then
    log "⚠️  WARNING: High CPU usage detected!"
    get_top_processes
  fi
  
  if [[ "$MEM_USAGE" != "N/A" ]] && (( $(echo "$MEM_USAGE > 90" | bc -l 2>/dev/null || echo 0) )); then
    log "⚠️  WARNING: High memory usage detected!"
  fi
  
  # Check event log every 5 iterations (every ~25 seconds)
  if [[ $((ITERATION % 5)) -eq 0 ]]; then
    log "Checking Event Viewer for recent errors..."
    check_event_log 5
  fi
  
  # Sleep until next check
  sleep "$MONITOR_INTERVAL"
done

log "=== Monitoring Complete ==="
log ""
log "To check Event Viewer manually:"
log "  1. Press Win+R, type 'eventvwr', press Enter"
log "  2. Navigate to: Windows Logs > System"
log "  3. Filter by: Error, Critical (right-click 'Filter Current Log')"
log "  4. Check timestamps around freeze times"
log ""
log "To check Reliability Monitor:"
log "  1. Press Win key, type 'Reliability', press Enter"
log "  2. Review timeline for hardware/software errors"
log ""
log "To check Performance Monitor:"
log "  1. Press Win+R, type 'perfmon', press Enter"
log "  2. Create a Data Collector Set to monitor system metrics"
log ""

if [[ "$ENABLE_LOG" == true ]]; then
  echo "Output logged to: $LOG_FILE"
fi


