FROM alpine:latest

# Solo lo necesario - SIN PHP
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
