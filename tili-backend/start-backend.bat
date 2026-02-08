@echo off
echo Starting TILI Backend Server...
echo.
cd /d "%~dp0"
C:\apache-maven-3.9.12\bin\mvn.cmd spring-boot:run

