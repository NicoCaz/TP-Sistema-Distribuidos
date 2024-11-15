# Usa una imagen base de Node.js
FROM node:18-alpine

# Instala http-server globalmente
RUN npm install -g http-server

# Crea y establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias incluyendo las devDependencies
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto 8080 para el servidor http
EXPOSE 8080

# Comando para iniciar el servidor de desarrollo
CMD ["npm", "start"]