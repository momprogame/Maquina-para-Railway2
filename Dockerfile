FROM alpine:latest

# Instalar paquetes - PHP 8.2 (NO php81)
RUN apk add --no-cache \
    nodejs \
    npm \
    curl \
    bash \
    supervisor

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x /app/start.sh /app/keep-alive.js /app/cron-worker.js 2>/dev/null || true

EXPOSE 3000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
