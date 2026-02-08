Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TILI BACKEND SERVER STARTUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking Java..." -ForegroundColor Yellow
java -version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Java is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Checking Maven..." -ForegroundColor Yellow
if (Test-Path "C:\apache-maven-3.9.12\bin\mvn.cmd") {
    Write-Host "Maven found at C:\apache-maven-3.9.12\bin\mvn.cmd" -ForegroundColor Green
} else {
    Write-Host "ERROR: Maven not found!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Checking MySQL..." -ForegroundColor Yellow
try {
    $result = & "C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "MySQL is running!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: MySQL might not be running!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARNING: Could not check MySQL status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Spring Boot backend..." -ForegroundColor Yellow
Write-Host "This will take 30-60 seconds. Please wait..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\maratech\tili-backend"
& "C:\apache-maven-3.9.12\bin\mvn.cmd" spring-boot:run

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend has stopped." -ForegroundColor Red
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

