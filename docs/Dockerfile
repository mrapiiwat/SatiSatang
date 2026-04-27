FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
RUN mkdir -p /usr/share/nginx/html/docs
COPY --from=builder /app/build /usr/share/nginx/html/docs
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]