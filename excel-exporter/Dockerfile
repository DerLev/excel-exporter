ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache nodejs yarn

WORKDIR /app/client

COPY client/package.json client/yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY client/ .
RUN yarn build

WORKDIR /app

COPY server/package.json server/yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY server/ .
RUN yarn build

RUN mv -f client/dist public
RUN rm -rf client/

RUN rm -rf src/

RUN sed -i 's|="/assets/|="assets/|g' public/index.html
RUN sed -i 's|="/assets/|="assets/|g' public/assets/index-*

CMD ["/usr/bin/with-contenv", "node", "dist/index.js"]
