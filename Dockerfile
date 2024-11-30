# Usar uma imagem oficial do Node.js (v20.17.0) baseada no Ubuntu como base
FROM node:20.17.0-bullseye-slim

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos necessários para o container
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Instalar as dependências do sistema necessárias para o Puppeteer (Chromium)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcups2 \
    libxshmfence1 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Expor a porta (se aplicável, substitua se seu bot usar outra porta)
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
