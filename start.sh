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
echo "Checking health files at root level:"
if [ -f "/var/www/html/health.php" ]; then
    echo "✅ /var/www/html/health.php exists"
    ls -la /var/www/html/health.php
else
    echo "❌ /var/www/html/health.php missing"
fi

if [ -f "/var/www/html/health.txt" ]; then
    echo "✅ /var/www/html/health.txt exists"
    ls -la /var/www/html/health.txt
    echo "Content:"
    cat /var/www/html/health.txt
else
    echo "❌ /var/www/html/health.txt missing"
fi

echo "Checking health files in UI directory:"
if [ -f "/var/www/html/ui/health.php" ]; then
    echo "✅ /var/www/html/ui/health.php exists"
else
    echo "❌ /var/www/html/ui/health.php missing"
fi

if [ -f "/var/www/html/ui/health.txt" ]; then
    echo "✅ /var/www/html/ui/health.txt exists"
else
    echo "❌ /var/www/html/ui/health.txt missing"
fi

# Test Apache before full start
echo "=== Testing Apache Config ==="
apache2ctl configtest

# Show active Apache configuration
echo "=== Active VirtualHost ==="
apache2ctl -S

# Create a simple test endpoint
echo "Creating test endpoint..."
echo "TEST OK" > /var/www/html/test.txt

# Start Apache
echo "=== Starting Apache ==="
exec apache2-foreground
