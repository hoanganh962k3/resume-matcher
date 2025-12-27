# Reset Database Script for Windows
# This script deletes the database files and lets the application recreate them with the correct schema

Write-Host "Resume Matcher - Database Reset Utility" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will delete the database to apply schema changes (added user_id fields)" -ForegroundColor Yellow
Write-Host "WARNING: All data will be lost!" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Are you sure you want to continue? (yes/no)"

if ($confirmation -eq "yes") {
    $dbPath = "apps\backend\app.db*"
    
    Write-Host ""
    Write-Host "Deleting database files..." -ForegroundColor Yellow
    
    if (Test-Path "apps\backend\app.db") {
        Remove-Item "apps\backend\app.db*" -Force
        Write-Host "✓ Database files deleted" -ForegroundColor Green
    } else {
        Write-Host "✓ No database files found (already clean)" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Database reset complete!" -ForegroundColor Green
    Write-Host "The database will be recreated automatically when the backend starts." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Schema changes applied:" -ForegroundColor Cyan
    Write-Host "  - Added user_id column to resumes table (nullable)" -ForegroundColor Gray
    Write-Host "  - Added user_id column to processed_resumes table (nullable)" -ForegroundColor Gray
    Write-Host "  - Added user_id column to jobs table (nullable)" -ForegroundColor Gray
    Write-Host "  - Added user_id column to processed_jobs table (nullable)" -ForegroundColor Gray
    Write-Host "  - Enabled User model relationships" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Now resumes and jobs can be:" -ForegroundColor Cyan
    Write-Host "  ✓ Linked to logged-in users (user_id set)" -ForegroundColor Green
    Write-Host "  ✓ Created by guests (user_id = NULL)" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Database reset cancelled." -ForegroundColor Red
    Write-Host ""
}
