# Gunakan base image Node.js
FROM node:20-alpine

# Set direktori kerja
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy sisa source code
COPY . .

# Expose port default Vite
EXPOSE 5173

# Perintah untuk menjalankan Vite dev server
# PENTING: `--host 0.0.0.0` wajib agar server bisa diakses dari luar container
CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]