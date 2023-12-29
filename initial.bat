:: Check if Python is already installed
where python >nul 2>&1
if %errorlevel% neq 0 (
    :: Python is not installed, proceed with installation

    :: Download Python installer
    powershell.exe -Command "Invoke-WebRequest -UseBasicParsing -Uri 'https://www.python.org/ftp/python/3.11.0/python-3.11.0-amd64.exe' -OutFile 'python-3.11.0-amd64.exe'"

    :: Install Python
    powershell.exe -Command "Start-Process -Wait -FilePath .\python-3.11.0-amd64.exe -ArgumentList '/quiet', 'InstallAllUsers=1', 'PrependPath=1', 'Include_test=0'"

    :: Remove the installer after installation (optional)
    del python-3.11.0-amd64.exe

) else (
    echo Python is already installed.
)

:: Check if Git is already installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    :: Git is not installed, proceed with installation

    :: Download Git installer
    powershell.exe -Command "Invoke-WebRequest -UseBasicParsing -Uri 'https://github.com/git-for-windows/git/releases/download/v2.36.0.windows.1/Git-2.36.0-64-bit.exe' -OutFile 'Git-2.36.0-64-bit.exe'"

    :: Install Git
    powershell.exe -Command "Start-Process -Wait -FilePath .\Git-2.36.0-64-bit.exe -ArgumentList '/SILENT /NORESTART /CLOSEAPPLICATIONS /COMPONENTS=icons,ext\reg\shellhere,assoc,assoc_sh'"

    :: Remove the installer after installation (optional)
    del Git-2.36.0-64-bit.exe

) else (
    echo Git is already installed.
)