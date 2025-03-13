# Node.js resmi imajını kullan
FROM node:18

# Çalışma dizini oluştur
WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm install

# Tüm kodları kopyala
COPY . .

# Uygulamayı başlat
CMD ["npm", "run", "start"]
