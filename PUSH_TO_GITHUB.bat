@echo off
echo.
echo ============================================================
echo   Tashkhees Support Portal - GitHub Push Tool
echo ============================================================
echo.

:: Check if git is available in user's environment
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git was not found in your system path.
    echo Please install Git from https://git-scm.com/ and try again.
    pause
    exit /b
)

echo [1/5] Initializing local repository...
if not exist .git (
    git init
)

echo [2/5] Adding remote origin...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/alihamza-h/Tashkhees-Support-Portal.git

echo [3/5] Staging all files...
git add .

echo [4/5] Committing changes...
git commit -m "Complete Premium UI/UX Overhaul, JWT Login Fix, and Documentation"

echo [5/5] Pushing to GitHub (main branch)...
echo.
echo NOTE: You may be prompted for your GitHub credentials.
echo.
git branch -M main
git push -u origin main --force

echo.
echo ============================================================
echo   DONE! Your code should now be live on GitHub.
echo ============================================================
pause
