# Tela (React + Vite). As peças (node_modules) ficam DENTRO do container:
# o computador da pessoa não precisa ter Node instalado.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
