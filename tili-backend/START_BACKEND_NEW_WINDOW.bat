@echo off
echo ========================================
echo   TILI Backend Server Startup
echo ========================================
echo.
echo Starting Spring Boot application...
echo This window will show the server logs.
echo.
echo DO NOT CLOSE THIS WINDOW while using the app!
echo.
cd /d "%~dp0"
C:\apache-maven-3.9.12\bin\mvn.cmd spring-boot:run
pause

