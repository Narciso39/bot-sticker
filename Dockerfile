# Etapa 1: Usar uma imagem base do Node.js
FROM node:20

# Etapa 2: Criar e definir o diretório de trabalho
WORKDIR /usr/src/app

# Etapa 3: Copiar o package.json e package-lock.json
COPY package*.json ./

# Etapa 4: Instalar as dependências do Node.js
RUN npm install

# Etapa 5: Instalar as dependências do sistema necessárias para o Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libxss1 \
    libappindicator3-1 \
    libappindicator1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Etapa 6: Instalar o ffmpeg (se necessário)
RUN apt-get update && apt-get install -y ffmpeg

# Etapa 7: Copiar o código da aplicação para o contêiner
COPY . .

# Etapa 8: Expor a porta (caso necessário)
EXPOSE 3000

# Etapa 9: Definir o comando para rodar o seu script Node.js
CMD ["npm", "start"]
