@echo off
echo Starting FoodReels Application Servers
echo ======================================

echo Starting MongoDB (make sure MongoDB is installed and running as a service)
echo If MongoDB is not running as a service, please start it manually
echo.

echo Starting Backend Server...
cd Backend
start "Backend Server" cmd /k "node server.js"
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
cd ..\Frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Servers started successfully!
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5175 (or next available port)
echo.
echo Note: If you encounter any issues, please check:
echo  - MongoDB is running
echo  - All dependencies are installed (npm install in both Backend and Frontend)
echo  - .env file is properly configured in Backend directory
echo.
echo Press any key to exit...
pause >nul