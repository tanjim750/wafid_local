@echo off

setlocal enabledelayedexpansion

rem Get the directory of the script
set "SCRIPT_DIR=%~dp0"

rem Navigate to the project directory
cd /d "%SCRIPT_DIR%"

rem Pulling changes from GitHub...
git pull https://github.com/tanjim750/wafid_local

rem Install dependencies
pip install anticaptchaofficial==1.0.59
pip install beautifulsoup4==4.12.2
pip install Django==5.0
pip install h11==0.14.0
pip install requests==2.31.0
pip install selenium==4.16.0
pip install psycopg2

rem Open the default browser to the Django development server address
start "" http://127.0.0.1:8000/

rem Start Django development server
python manage.py runserver

endlocal
