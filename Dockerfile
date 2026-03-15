FROM alpine:latest

# Instalar dependencias con PHP 8.2 (la versión actual en Alpine)
RUN apk add --no-cache \
    nodejs \
    npm \
    curl \
    bash \
    nginx \
    php82 \
    php82-fpm \
    php82-mysqli \
    php82-pdo \
    php82-pdo_mysql \
    php82-sqlite3 \
    php82-curl \
    php82-openssl \
    php82-mbstring \
    php82-xml \
    php82-session \
    php82-gd \
    supervisor \
    sqlite

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p /run/nginx /var/www/html /var/lib/nginx /var/log/nginx
RUN mkdir -p /run/php-fpm82

RUN chmod +x /app/start.sh /app/keep-alive.js /app/cron-worker.js 2>/dev/null || true

EXPOSE 3000 8080 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
