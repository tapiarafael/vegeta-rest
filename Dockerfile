FROM node:16-alpine

ENV VEGETA_VERSION 12.8.4

RUN set -ex \
  && apk add --no-cache ca-certificates jq \
  && apk add --no-cache --virtual .build-deps \
  && apk add jq \
  openssl \
  && wget -q "https://github.com/tsenart/vegeta/releases/download/v${VEGETA_VERSION}/vegeta_${VEGETA_VERSION}_linux_amd64.tar.gz" -O /tmp/vegeta.tar.gz \
  && cd bin \
  && tar xzf /tmp/vegeta.tar.gz \
  && rm /tmp/vegeta.tar.gz \
  && apk del .build-deps

WORKDIR /app

COPY index.js package.json ./

RUN npm install --quiet

EXPOSE 3000

CMD node index.js