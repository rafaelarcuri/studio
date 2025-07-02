FROM node:18

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante dos arquivos do backend
COPY . .

# Porta exposta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "backend-whatsapp-multi.js"]
