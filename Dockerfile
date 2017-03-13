FROM makeomatic/node:$NODE_VERSION

ENV NCONF_NAMESPACE=MS_CHAT \
    NODE_ENV=$NODE_ENV

WORKDIR /src

COPY package.json yarn.lock .
RUN \
  apk --no-cache add --virtual .buildDeps \
    build-base \
    python \
    git \
    curl \
    openssl \
  && yarn --production \
  && apk del \
    .buildDeps \
    wget \
  && rm -rf \
    /tmp/* \
    /root/.node-gyp \
    /root/.npm

COPY . /src
RUN  chown -R node /src
USER node

EXPOSE 3000
