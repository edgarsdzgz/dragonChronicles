# PowerShell script to check Windows Event Viewer for freeze-related events
# Checks System and Application logs for common freeze indicators

Write-Host "=== Windows Freeze Event Checker ===" -ForegroundColor Cyan
Write-Host ""

# Get current time and last 24 hours
$endTime = Get-Date
$startTime = $endTime.AddHours(-24)

Write-Host "Checking events from: $startTime to $endTime" -ForegroundColor Yellow
Write-Host ""

# Function to check events
function Check-LogEvents {
    param(
        [string]$LogName,
        [string[]]$EntryTypes,
        [string[]]$EventIds = $null,
        [string[]]$Sources = $null
    )
    
    Write-Host "--- Checking $LogName Log ---" -ForegroundColor Green
    
    $filter = @{
        LogName = $LogName
        StartTime = $startTime
        EndTime = $endTime
    }
    
    if ($EntryTypes) {
        $filter['Level'] = $EntryTypes
    }
    
    try {
        $events = Get-WinEvent -FilterHashtable $filter -ErrorAction SilentlyContinue | 
            Select-Object TimeCreated, Id, LevelDisplayName, ProviderName, Message | 
            Sort-Object TimeCreated -Descending
        
        if ($events) {
            # Filter by Event IDs if provided
            if ($EventIds) {
                $events = $events | Where-Object { $_.Id -in $EventIds }
            }
            
            # Filter by Sources if provided
            if ($Sources) {
                $events = $events | Where-Object { $_.ProviderName -in $Sources }
            }
            
            if ($events) {
                Write-Host "Found $($events.Count) matching event(s):" -ForegroundColor Yellow
                $events | Format-Table TimeCreated, Id, LevelDisplayName, ProviderName -AutoSize
                
                # Show details of most recent events
                Write-Host "`nRecent event details:" -ForegroundColor Cyan
                $events | Select-Object -First 5 | ForEach-Object {
                    Write-Host "`n[$($_.TimeCreated)] Event ID $($_.Id) - $($_.LevelDisplayName)" -ForegroundColor White
                    Write-Host "Source: $($_.ProviderName)" -ForegroundColor Gray
                    Write-Host "Message: $($_.Message.Substring(0, [Math]::Min(200, $_.Message.Length)))..." -ForegroundColor Gray
                }
            } else {
                Write-Host "No matching events found in this time period." -ForegroundColor Gray
            }
        } else {
            Write-Host "No events found in $LogName log (last 24 hours)." -ForegroundColor Gray
        }
    } catch {
        Write-Host "Error accessing $LogName log: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Critical System Events to Check
Write-Host "=== Checking for Critical System Events ===" -ForegroundColor Cyan

# 1. Kernel-Power events (power issues, unexpected shutdowns)
Check-LogEvents -LogName "System" -EntryTypes @("Critical", "Error") -Sources @("Microsoft-Windows-Kernel-Power")

# 2. Event ID 41 (unexpected shutdowns/freezes)
Write-Host "--- Checking for Event ID 41 (Unexpected Shutdowns) ---" -ForegroundColor Green
Check-LogEvents -LogName "System" -EntryTypes @("Critical") -EventIds @(41)

# 3. Disk errors
Write-Host "=== Checking for Disk Errors ===" -ForegroundColor Cyan
Check-LogEvents -LogName "System" -EntryTypes @("Error", "Warning") -Sources @("disk", "ntfs", "stornvme", "Microsoft-Windows-Disk")

# 4. Memory errors
Write-Host "=== Checking for Memory Errors ===" -ForegroundColor Cyan
Check-LogEvents -LogName "System" -EntryTypes @("Error", "Warning") -Sources @("Microsoft-Windows-MemoryDiagnostics-Results", "MemoryDiagnostics")

# 5. Driver errors
Write-Host "=== Checking for Driver Errors ===" -ForegroundColor Cyan
Check-LogEvents -LogName "System" -EntryTypes @("Error", "Warning") -Sources @("Microsoft-Windows-Kernel-General", "driver")

# 6. Hardware errors
Write-Host "=== Checking for Hardware Errors ===" -ForegroundColor Cyan
Check-LogEvents -LogName "System" -EntryTypes @("Error", "Warning") -Sources @("Microsoft-Windows-Kernel-WHEA")

# 7. Application crashes
Write-Host "=== Checking Application Log for Crashes ===" -ForegroundColor Cyan
Check-LogEvents -LogName "Application" -EntryTypes @("Error", "Warning")

# 8. Blue Screen / Bugcheck events
Write-Host "=== Checking for Bugcheck/BSOD Events ===" -ForegroundColor Cyan
Check-LogEvents -LogName "System" -EntryTypes @("Error", "Critical") -Sources @("Microsoft-Windows-WER-SystemErrorReporting", "BugCheck")

# Summary Statistics
Write-Host "=== Event Summary (Last 24 Hours) ===" -ForegroundColor Cyan

try {
    $systemStats = Get-WinEvent -FilterHashtable @{
        LogName = "System"
        StartTime = $startTime
        EndTime = $endTime
    } -ErrorAction SilentlyContinue | 
    Group-Object LevelDisplayName | 
    Select-Object Name, Count
    
    if ($systemStats) {
        Write-Host "`nSystem Log Statistics:" -ForegroundColor Yellow
        $systemStats | Format-Table -AutoSize
    }
    
    $appStats = Get-WinEvent -FilterHashtable @{
        LogName = "Application"
        StartTime = $startTime
        EndTime = $endTime
    } -ErrorAction SilentlyContinue | 
    Group-Object LevelDisplayName | 
    Select-Object Name, Count
    
    if ($appStats) {
        Write-Host "`nApplication Log Statistics:" -ForegroundColor Yellow
        $appStats | Format-Table -AutoSize
    }
} catch {
    Write-Host "Could not retrieve statistics: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Recommendations ===" -ForegroundColor Cyan
Write-Host "1. Check Reliability Monitor: Press Win key, type 'Reliability'" -ForegroundColor White
Write-Host "2. Run memory diagnostic: Press Win+R, type 'mdsched.exe'" -ForegroundColor White
Write-Host "3. Check disk health with: CrystalDiskInfo or HWiNFO" -ForegroundColor White
Write-Host "4. Monitor system during freeze using: .\windows-system-monitor.sh" -ForegroundColor White
Write-Host "5. Check for driver updates (especially graphics and chipset)" -ForegroundColor White
Write-Host ""


