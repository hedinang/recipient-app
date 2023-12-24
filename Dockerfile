FROM node:12.22.12-alpine as builder

LABEL maintainer="Dat <d.tran@axlehire.com>"

ARG NPM_REGISTRY_URL

ARG NPM_AUTH_KEY

ARG NPM_EMAIL

ARG NODE_OPTIONS

ARG GENERATE_SOURCEMAP=true

ENV NPM_REGISTRY_URL $NPM_REGISTRY_URL

ENV NPM_AUTH_KEY $NPM_AUTH_KEY

ENV NPM_EMAIL $NPM_EMAIL

ENV NODE_OPTIONS $NODE_OPTIONS

ENV GENERATE_SOURCEMAP $GENERATE_SOURCEMAP

WORKDIR /app/bin

COPY package*.json ./

COPY yarn.lock ./

COPY install.sh ./

RUN sh install.sh

COPY . ./

RUN sh build.sh

FROM nginx:1-alpine

RUN apk add --update --no-cache perl

COPY nginx.conf /etc/nginx/nginx.conf.template

RUN rm -rf /usr/share/nginx/html/*

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/bin/build ./

ENV PORT 80

ENV HOST 0.0.0.0

COPY entrypoint.sh /usr/local/bin/

ENTRYPOINT [ "entrypoint.sh" ]