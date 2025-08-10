# Use PHP with Apache
FROM php:8.1-apache

# Install PHP extensions and system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mysqli gd zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy project files
COPY . /var/www/html/

# Copy Apache configuration
COPY deployment/apache-vhost.conf /etc/apache2/sites-available/000-default.conf

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html && \
    chmod +x /var/www/html/deployment/start.sh

# Configure Apache
RUN echo "ServerName localhost" > /etc/apache2/conf-available/servername.conf && \
    a2enconf servername && \
    a2ensite 000-default

# Create simple health checks at multiple locations
RUN echo "OK" > /var/www/html/health.txt && \
    echo "OK" > /var/www/html/ui/health.txt && \
    cp /var/www/html/health.php /var/www/html/ui/health.php

# Set working directory
WORKDIR /var/www/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/test.txt || curl -f http://localhost/health.txt || exit 1

# Start Apache - debug first
CMD ["bash", "-c", "echo 'Container starting...' && /var/www/html/deployment/start.sh"]
