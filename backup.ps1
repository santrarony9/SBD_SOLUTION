$source = "C:\Users\NEWS THE TRUTH\Desktop\anti gravity\SBD_SOLUTION"
$tempDest = "D:\SBD_SOLUTION_Backup_Temp"
$timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm"
$zipFile = "D:\SBD_SOLUTION_Backup_$timestamp.zip"

Write-Host "Starting backup process..."
Write-Host "Copying necessary files to temporary directory to exclude heavy folders..."
# robocopy returns exit code 1 if files were copied, which makes powershell throw if ErrorAction is Stop, so we just run it
robocopy $source $tempDest /S /E /XD node_modules .next .git dist .vercel

Write-Host "Zipping the files to $zipFile..."
Compress-Archive -Path "$tempDest\*" -DestinationPath $zipFile -Force

Write-Host "Cleaning up temporary files..."
Remove-Item -Recurse -Force $tempDest

Write-Host "Backup successfully created at: $zipFile"
