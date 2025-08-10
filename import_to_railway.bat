@echo off
echo Importing database schema to Railway MySQL...
echo.
echo Please make sure you have MySQL client installed
echo.
echo Copy the MySQL URL from Railway and run:
echo mysql "YOUR_MYSQL_URL_HERE" < railway_schema.sql
echo.
echo Example:
echo mysql "mysql://root:password@hostname:3306/railway" < railway_schema.sql
echo.
pause
