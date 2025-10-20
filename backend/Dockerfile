# Gunakan base image Node.js
FROM node:20-alpine

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy sisa source code
COPY . .

# Expose port yang digunakan backend
EXPOSE 3001

# Perintah untuk menjalankan aplikasi
CMD [ "node", "index.js" ]