# Basis-Image
FROM debian:bullseye-slim

# Installiere notwendige Pakete
RUN apt-get update && apt-get install -y \
    tor \
    curl \
    nano \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Konfiguriere Tor (minimal)
RUN echo "SocksPort 0.0.0.0:9050\nControlPort 9051\nCookieAuthentication 0" > /etc/tor/torrc

# Exponiere Tor-Ports
EXPOSE 9050 9051

# Startbefehl für Tor
CMD ["tor"]

