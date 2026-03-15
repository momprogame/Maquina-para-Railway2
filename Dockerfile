FROM alpine:latest

# Instalar dependencias básicas (versiones actualizadas de PHP)
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
    php82-phar \
    supervisor \
    sqlite

# Crear enlaces simbólicos para compatibilidad (opcional)
RUN ln -s /usr/bin/php82 /usr/bin/php || true

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Configurar directorios
RUN mkdir -p /run/nginx /var/www/html /var/lib/nginx /var/log/nginx
RUN mkdir -p /run/php-fpm82

# Dar permisos
RUN chmod +x /app/start.sh /app/keep-alive.js /app/cron-worker.js 2>/dev/null || true

EXPOSE 3000 8080 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
