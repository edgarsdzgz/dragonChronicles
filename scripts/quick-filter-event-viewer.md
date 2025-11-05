# Quick Event Viewer Filter Guide for Freeze Diagnosis

## Current Situation
You're looking at the System log with 40,558 events. Most visible events are:
- **TPM-WMI Error 1801**: Secure Boot CA/keys update (usually not freeze-related)
- **DistributedCOM Warning 10016**: COM permission warnings (common, usually harmless)

## Next Steps to Find Freeze-Related Events

### Step 1: Filter the System Log
1. In the **Actions** pane (right side), click **"Filter Current Log..."**
2. In the Filter dialog:
   - **Event level:** Check ✅ **Critical** and ✅ **Error** (uncheck others)
   - **Logged:** Select **"Last 24 hours"** or **"Last 7 days"**
   - Click **OK**

This will reduce 40,558 events to only critical errors.

### Step 2: Look for These Specific Event IDs

After filtering, look for these Event IDs around your freeze times:

#### **Kernel-Power Events (Most Important)**
- **Event ID 41**: Unexpected shutdown/freeze
- **Event ID 6008**: Unexpected shutdown
- **Source:** Microsoft-Windows-Kernel-Power

#### **Disk/Storage Issues**
- **Event ID 129**: Disk I/O timeout
- **Event ID 51**: Disk error
- **Source:** disk, ntfs, stornvme, Microsoft-Windows-Disk

#### **Memory Issues**
- **Event ID 2001**: Memory diagnostic results
- **Source:** Microsoft-Windows-MemoryDiagnostics-Results

#### **Hardware Errors**
- **Event ID 19**: Hardware error (WHEA)
- **Source:** Microsoft-Windows-Kernel-WHEA

#### **Driver Issues**
- Various driver timeouts
- **Source:** driver-related sources

### Step 3: Check Event Times

1. After filtering, events are sorted by time (newest first)
2. Note the **time of your last freeze**
3. Scroll to events around that time
4. Look for **Critical** (red circle with X) or **Error** (red circle with !) events

### Step 4: Review Event Details

When you find a suspicious event:
1. Double-click the event to open details
2. Check the **General** tab for description
3. Look for:
   - "Unexpected shutdown"
   - "Disk timeout"
   - "Hardware error"
   - "Memory error"
   - "Driver timeout"

### Step 5: Use Find Feature

1. In **Actions** pane, click **"Find..."**
2. Search for:
   - "freeze"
   - "timeout"
   - "Kernel-Power"
   - "BugCheck"
   - "unexpected"
3. This will highlight relevant events

## Alternative: Use PowerShell Script

Instead of manual filtering, run:

```powershell
# Run from PowerShell
powershell -ExecutionPolicy Bypass -File scripts/check-event-viewer-freeze-events.ps1
```

This automatically checks for all freeze-related events and shows a summary.

## What the Current Events Mean

### TPM-WMI Event ID 1801 (Selected Event)
- **Type:** Error (but operation completed successfully)
- **Meaning:** Secure Boot certificate update notification
- **Freeze-related?** **NO** - This is informational, despite being labeled "Error"

### DistributedCOM Event ID 10016 (Visible Events)
- **Type:** Warning
- **Meaning:** COM permission warnings (very common)
- **Freeze-related?** **NO** - These are harmless warnings

## Red Flags to Look For

When filtering for Critical/Error events, these are concerning:

✅ **RED FLAG:** Event ID 41 (Kernel-Power) with "unexpected shutdown"  
✅ **RED FLAG:** Disk errors (Event ID 129, 51)  
✅ **RED FLAG:** Memory diagnostic errors  
✅ **RED FLAG:** BugCheck events (blue screen related)  
✅ **RED FLAG:** Hardware errors (WHEA)  

❌ **NOT concerning:** TPM-WMI 1801 (Secure Boot notifications)  
❌ **NOT concerning:** DistributedCOM 10016 (common permission warnings)  
❌ **NOT concerning:** Information-level events  

## Quick Action Checklist

- [ ] Filter System log for Critical + Error events (last 24 hours)
- [ ] Note time of last freeze
- [ ] Scroll to events around that time
- [ ] Look for Event ID 41 (Kernel-Power)
- [ ] Check for disk errors (Event ID 129, 51)
- [ ] Run PowerShell script for automated check
- [ ] Check Reliability Monitor for visual timeline


