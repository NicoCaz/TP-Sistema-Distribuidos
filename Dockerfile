FROM node:18

# Carpeta de trabajo para la API
WORKDIR /app

# Copia el código de la API sin dependencias
COPY API/ ./

# No instales dependencias aquí porque no hay package.json
# Corre directamente el servidor (suponiendo que es 'server.js')
CMD ["node", "server.js"]
