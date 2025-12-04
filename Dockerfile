FROM node:20

# ImageMagick installieren
RUN apt-get update && apt-get install -y imagemagick

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Backend starten
CMD ["node", "src/index.js"]

EXPOSE 4000
