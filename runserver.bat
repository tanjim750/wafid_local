@echo off

setlocal enabledelayedexpansion

rem Get the directory of the script
set "SCRIPT_DIR=%~dp0"

rem Navigate to the project directory
cd /d "%SCRIPT_DIR%"

rem Pulling changes from GitHub...
git pull https://github.com/tanjim750/wafid_local

rem Activate the virtual environment
call venv\Scripts\activate

rem Install dependencies
pip install -r requirements.txt

rem Run migrations
python manage.py migrate

rem Start Django development server
python manage.py runserver

rem Wait for the server to start
timeout /t 5

rem Open the default browser to the Django development server address
start "" http://127.0.0.1:8000/

rem Deactivate the virtual environment
deactivate

endlocal
