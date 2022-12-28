FROM node:16.18.1-alpine

RUN apk add --update \
  python3 \
  build-base \
  gcc \
  zlib-dev \
  libpng-dev

WORKDIR /app

CMD ["sh", "-c", "yarn install && yarn dev"]
