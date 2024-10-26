FROM node:18 as build
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build

FROM nginx:latest
COPY --from=build app/dist/user-app /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/
EXPOSE 80