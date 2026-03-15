# Una línea lo gobierna a todos
FROM alpine:latest

# Instalación masiva en una sola capa
RUN apk update && apk add --no-cache bash curl wget git nano vim htop nodejs npm python3 py3-pip openssh-client tmux screen redis postgresql-client mysql-client ffmpeg && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar SOLO lo necesario
COPY package*.json ./
COPY server.js ./

# Instalar dependencias globales y locales
RUN npm install -g pm2 forever && npm install && npm cache clean --force

# Todo en un solo comando
EXPOSE 3000
CMD node server.js
