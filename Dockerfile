FROM node:12-alpine

COPY . /jackett-sync

WORKDIR /jackett-sync

RUN yarn install