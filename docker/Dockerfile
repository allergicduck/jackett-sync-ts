FROM node:12-alpine

COPY . /jackett-sync
COPY ./docker/entrypoint.sh /

WORKDIR /jackett-sync

RUN npm install
RUN npm run build

ENTRYPOINT [ "/bin/sh", "/entrypoint.sh" ]