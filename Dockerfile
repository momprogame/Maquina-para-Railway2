# Imagen base
FROM alpine:latest

# Instalación por capas para mejor debugging
RUN apk update
RUN apk add --no-cache \
    bash \
    curl \
    wget \
    git \
    nano \
    vim \
    htop \
    nodejs \
    npm \
    python3 \
    py3-pip \
    openssh-client \
    tmux \
    screen \
    redis \
    postgresql-client \
    mysql-client \
    ffmpeg \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias UNA POR UNA para evitar errores
RUN npm install -g pm2 && \
    npm install -g forever && \
    npm install express --save && \
    npm install sshx --save && \
    npm cache clean --force

# Copiar el código
COPY server.js ./

# Puerto
EXPOSE 3000

# Comando de inicio (usando node directamente para evitar problemas con npm start)
CMD ["node", "server.js"]
