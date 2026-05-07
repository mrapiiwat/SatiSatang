FROM node:22-slim AS builder
WORKDIR /app
ARG VITE_MODE
ARG VITE_GOOGLE_SCRIPT_URL
ARG VITE_FIREBASE_VAPID_KEY
ENV VITE_MODE=$VITE_MODE
ENV VITE_GOOGLE_SCRIPT_URL=$VITE_GOOGLE_SCRIPT_URL
ENV VITE_FIREBASE_VAPID_KEY=$VITE_FIREBASE_VAPID_KEY
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