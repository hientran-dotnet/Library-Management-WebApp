#!/bin/bash

# Startup script for Railway deployment debugging
echo "=== Library Management System Starting ==="
echo "Environment: $RAILWAY_ENVIRONMENT"
echo "Service ID: $RAILWAY_SERVICE_ID"
echo "Deployment ID: $RAILWAY_DEPLOYMENT_ID"

# Check environment variables
echo "=== Environment Variables ==="
echo "DB_HOST: ${DB_HOST:-'not set'}"
echo "DB_NAME: ${DB_NAME:-'not set'}"
echo "DB_USER: ${DB_USER:-'not set'}"
echo "DB_PORT: ${DB_PORT:-'not set'}"

# Check file structure
echo "=== File Structure ==="
ls -la /var/www/html/
echo "UI Directory:"
ls -la /var/www/html/ui/
echo "APIs Directory:"
ls -la /var/www/html/apis/

# Check Apache configuration
echo "=== Apache Configuration ==="
apache2ctl configtest

# Check if health endpoints exist
echo "=== Health Endpoints ==="
if [ -f "/var/www/html/ui/health.php" ]; then
    echo "health.php exists"
else
    echo "health.php missing"
fi

if [ -f "/var/www/html/ui/health.txt" ]; then
    echo "health.txt exists"
else
    echo "health.txt missing"
fi

# Start Apache
echo "=== Starting Apache ==="
exec apache2-foreground
