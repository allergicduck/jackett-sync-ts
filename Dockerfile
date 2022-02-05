FROM node:16-alpine

COPY . /jackett-sync

WORKDIR /jackett-sync

RUN npm install
RUN npm run build

ENTRYPOINT [ "node", "dist/src/main.js" ]