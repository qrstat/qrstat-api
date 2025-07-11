FROM node:18-alpine3.18

RUN echo "http://mirror.yandex.ru/mirrors/alpine/v3.21/main" > /etc/apk/repositories && \
  echo "http://mirror.yandex.ru/mirrors/alpine/v3.21/community" >> /etc/apk/repositories && \
  apk update
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV npm_config_disturl https://nodejs.org/dist/

WORKDIR /opt/
COPY package.json yarn.lock ./
RUN yarn global add node-gyp
RUN yarn config set network-timeout 600000 -g && yarn install
RUN yarn add sharp --ignore-engines
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app

EXPOSE 1337
CMD ["yarn", "dev"]