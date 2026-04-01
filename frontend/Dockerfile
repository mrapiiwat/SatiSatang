FROM node:22-slim AS builder
WORKDIR /app
ARG VITE_MODE
ARG VITE_GOOGLE_SCRIPT_URL
ARG VITE_FIREBASE_VAPID_KEY
RUN echo "VITE_MODE=${VITE_MODE}" > .env && \
    echo "VITE_GOOGLE_SCRIPT_URL=${VITE_GOOGLE_SCRIPT_URL}" >> .env && \
    echo "VITE_FIREBASE_VAPID_KEY=${VITE_FIREBASE_VAPID_KEY}" >> .env
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1-alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]