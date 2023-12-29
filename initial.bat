@echo off

:: Download Python installer
powershell.exe -Command "Invoke-WebRequest -UseBasicParsing -Uri 'https://www.python.org/ftp/python/3.11.0/python-3.11.0-amd64.exe' -OutFile 'python-3.11.0-amd64.exe'"

:: Install Python
powershell.exe -Command "Start-Process -Wait -FilePath .\python-3.11.0-amd64.exe -ArgumentList '/quiet', 'InstallAllUsers=1', 'PrependPath=1', 'Include_test=0'"

:: Remove the installer after installation (optional)
del python-3.11.0-amd64.exe

enter