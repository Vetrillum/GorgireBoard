@echo off
cd /d "%~dp0"
echo Staging all changes...
git add .

echo Committing changes...
set /p commitMsg=Enter commit message: 
git commit -m "%commitMsg%"

echo Pushing to GitHub...
git push origin main

pause