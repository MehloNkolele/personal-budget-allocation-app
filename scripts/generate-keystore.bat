@echo off
echo Generating Android Keystore for Budget Tracker Pro
echo.

set /p STORE_PASSWORD="Enter store password: "
set /p KEY_PASSWORD="Enter key password: "
set /p ALIAS_NAME="Enter key alias (default: budget-tracker): "
if "%ALIAS_NAME%"=="" set ALIAS_NAME=budget-tracker

set /p YOUR_NAME="Enter your name: "
set /p ORGANIZATION="Enter organization (optional): "
set /p CITY="Enter city: "
set /p STATE="Enter state/province: "
set /p COUNTRY="Enter country code (e.g., US): "

echo.
echo Generating keystore...

cd android

keytool -genkey -v -keystore budget-tracker-key.keystore -alias %ALIAS_NAME% -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=%YOUR_NAME%, OU=%ORGANIZATION%, L=%CITY%, ST=%STATE%, C=%COUNTRY%" -storepass %STORE_PASSWORD% -keypass %KEY_PASSWORD%

echo.
echo Creating key.properties file...

echo storePassword=%STORE_PASSWORD% > key.properties
echo keyPassword=%KEY_PASSWORD% >> key.properties
echo keyAlias=%ALIAS_NAME% >> key.properties
echo storeFile=budget-tracker-key.keystore >> key.properties

echo.
echo Keystore generated successfully!
echo Files created:
echo - android/budget-tracker-key.keystore
echo - android/key.properties
echo.
echo IMPORTANT: Keep these files secure and backed up!
echo.
pause
