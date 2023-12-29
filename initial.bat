@echo off
set PYTHON_VERSION=3.8.5  # Change this to the version you downloaded
set GIT_VERSION=2.35.1   # Change this to the version you want

:: Install Python for all users
msiexec /i python-%PYTHON_VERSION%-amd64.exe /quiet TARGETDIR=C:\Python38 /ADDLOCAL=ALL /PYTHONALLUSERS=1 /PrependPath=1

:: Install Git for all users
msiexec /i Git-%GIT_VERSION%-64-bit.exe /quiet /COMPONENTS="icons,ext\reg\shellhere,assoc,assoc_sh" /DIR="C:\Git" /ADDLOCAL=FeatureSelect /INSTALLDIR="C:\Git"

pip install virtualenv

