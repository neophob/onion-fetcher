# Base image
FROM node:20-alpine

RUN apk add --no-cache \
    tor \
    curl \
    nano \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN echo "SocksPort 0.0.0.0:9050\nControlPort 9051\nCookieAuthentication 0" > /etc/tor/torrc

COPY package.json /app/package.json
WORKDIR /app
RUN npm install

COPY fetch.js /fetch.js

EXPOSE 9050 9051

CMD ["sh"]

