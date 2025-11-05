# Windows 10 Freeze Diagnostic Guide

## Quick Access to Windows Logs

### 1. Event Viewer (Primary Diagnostic Tool)

**Access**: Press `Win + R`, type `eventvwr`, press Enter

**What to Check**:
- Navigate to: **Windows Logs** > **System**
- Right-click on "System" > **Filter Current Log**
- Check boxes for: **Error**, **Critical**, **Warning**
- Set time range to cover your freeze events
- Look for entries around the time of freezes

**Key Events to Look For**:
- **Kernel-Power** errors (power issues, hardware failure)
- **Event ID 41** (unexpected shutdowns)
- **Disk errors** (hard drive issues)
- **Memory errors** (RAM problems)
- **Driver errors** (hardware driver crashes)

### 2. Reliability Monitor

**Access**: Press `Win` key, type `Reliability`, select "View reliability history"

**What It Shows**:
- Timeline of system events and failures
- Software crashes
- Hardware failures
- Windows updates
- Application installs/uninstalls

**Benefits**:
- Easy-to-read graphical interface
- Shows correlation between events
- Identifies patterns in failures

### 3. Performance Monitor (PerfMon)

**Access**: Press `Win + R`, type `perfmon`, press Enter

**Use For**:
- Real-time system monitoring
- Creating performance counter logs
- Identifying resource bottlenecks

**Key Metrics to Monitor**:
- CPU usage (% Processor Time)
- Memory usage (Available MBytes)
- Disk activity (% Disk Time)
- Network activity

### 4. Memory Diagnostic Tool

**Access**: Press `Win + R`, type `mdsched.exe`, press Enter

**What It Does**:
- Tests RAM for errors
- Requires system restart
- Runs automatically on next boot

### 5. System File Checker (SFC)

**Access**: Open Command Prompt as Administrator

**Commands**:
```bash
# Check and repair system files
sfc /scannow

# After SFC, run DISM
DISM /Online /Cleanup-Image /RestoreHealth

# Restart after completion
```

## Common Freeze Causes

### Hardware Issues
- **Faulty RAM**: Run memory diagnostic
- **Failing hard drive**: Check disk health (CrystalDiskInfo, HWiNFO)
- **Overheating**: Monitor CPU/GPU temps
- **Power supply issues**: Check for Kernel-Power errors
- **Driver problems**: Update graphics, chipset drivers

### Software Issues
- **Background processes**: Check Task Manager for resource hogs
- **Antivirus conflicts**: Temporarily disable to test
- **Windows updates**: Check if freezes started after an update
- **Corrupted system files**: Run SFC/DISM
- **Malware**: Run full antivirus scan

### Resource Exhaustion
- **Memory leaks**: Check Task Manager memory usage
- **High CPU usage**: Identify processes using CPU
- **Disk space**: Ensure C: drive has free space
- **Page file issues**: Check virtual memory settings

## Using the Monitoring Script

The `windows-system-monitor.sh` script can help identify issues:

```bash
# Basic monitoring (60 seconds)
./scripts/windows-system-monitor.sh

# With logging (saves to monitor.log)
./scripts/windows-system-monitor.sh --log

# Custom duration (5 minutes)
./scripts/windows-system-monitor.sh --log --duration 300
```

## Third-Party Tools

### Hardware Monitoring
- **HWiNFO**: Comprehensive hardware monitoring (free)
- **CPU-Z**: CPU and memory information
- **GPU-Z**: Graphics card monitoring

### Disk Health
- **CrystalDiskInfo**: Hard drive health monitoring
- **Hard Disk Sentinel**: Advanced disk monitoring

### Process Monitoring
- **Process Explorer** (Sysinternals): Advanced process viewer
- **Task Manager**: Built-in (Ctrl+Shift+Esc)

## Diagnostic Checklist

When investigating a freeze:

1. **Check Event Viewer** for errors around freeze time
2. **Review Reliability Monitor** for patterns
3. **Run memory diagnostic** if RAM errors suspected
4. **Monitor system resources** using the script or Task Manager
5. **Check disk health** with CrystalDiskInfo
6. **Update drivers** (especially graphics and chipset)
7. **Run SFC/DISM** to repair system files
8. **Check for overheating** (CPU/GPU temperatures)
9. **Review recent software installations**
10. **Check for Windows updates** pending

## Exporting Event Logs

To save Event Viewer logs for analysis:

1. Open Event Viewer
2. Navigate to **Windows Logs** > **System**
3. Right-click **System** > **Save All Events As...**
4. Choose location and save as `.evtx` file
5. Share file for technical support if needed

## Step-by-Step Event Viewer Navigation

Based on your current Event Viewer window:

### Step 1: Open the System Log
1. In the left pane (Console Tree), expand **Windows Logs**
2. Click on **System** (this is the most important log for freezes)
3. The center pane will show all System events

### Step 2: Filter for Critical Events
1. Right-click on **System** in the left pane
2. Select **Filter Current Log...**
3. In the filter dialog:
   - Check **Critical** and **Error** (and optionally **Warning**)
   - Set **Logged:** to **Last 24 hours** or set custom date range
   - Click **OK**
4. Review the filtered events - look for patterns around freeze times

### Step 3: Check Specific Event IDs
Common freeze-related Event IDs to look for:
- **Event ID 41**: Unexpected shutdown (kernel-power)
- **Event ID 6008**: Unexpected shutdown
- **Event ID 1001**: Windows Error Reporting (WER)
- **Event ID 1000**: Application crash
- **Event ID 129**: Disk I/O timeout (storage issues)
- **Event ID 51**: Disk error
- **Event ID 10110, 10111**: Driver timeout/failure

### Step 4: Use PowerShell Script
Run the PowerShell diagnostic script:
```powershell
# Run from PowerShell (as Administrator for best results)
powershell -ExecutionPolicy Bypass -File scripts/check-event-viewer-freeze-events.ps1
```

This script automatically checks for:
- Kernel-Power events (unexpected shutdowns)
- Disk errors
- Memory errors
- Driver errors
- Hardware errors
- Application crashes

### Step 5: Check Application Log Too
1. In the left pane, under **Windows Logs**, click **Application**
2. Filter for **Error** and **Warning** events
3. Look for application crashes that might coincide with freezes

### Step 6: Review Event Details
When you find an event:
1. Double-click the event to see full details
2. Check the **General** tab for description
3. Check the **Details** tab for technical information
4. Note the **Event ID**, **Source**, and **Time** for correlation

## Alternative: Use Reliability Monitor First

**Reliability Monitor** is often easier to use for identifying freeze patterns:

1. Press `Win` key, type `Reliability`, press Enter
2. You'll see a timeline graph with:
   - Red X marks for critical events
   - Yellow warning icons
   - Blue information icons
3. Click on any event to see details
4. Look for patterns: Do freezes happen at specific times? After specific actions?

## Next Steps

1. **Navigate to System Log** in Event Viewer (Windows Logs > System)
2. **Filter for Critical/Error events** from last 24 hours
3. **Run the PowerShell script** to automatically check for freeze-related events
4. **Check Reliability Monitor** for a visual timeline
5. **Run the monitoring script** during normal usage to catch issues in real-time
6. **Document** when freezes occur (time, activity, duration)
7. **Look for patterns**: Same time of day? Same application? Same activity?

