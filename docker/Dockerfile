FROM node:12-alpine

COPY . /jackett-sync
COPY ./docker/entrypoint.sh /

WORKDIR /jackett-sync

RUN yarn install

ENTRYPOINT [ "/entrypoint.sh" ]