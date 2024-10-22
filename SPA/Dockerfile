# Usar una imagen base oficial de Node.js
FROM node:14

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación va a correr
EXPOSE 8080

# Comando para correr la aplicación
CMD ["npm", "run", "start"]  # Este comando se ejecuta al iniciar el contenedor
