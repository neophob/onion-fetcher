# Onion Fetcher

Fetch onion pages and aggregate it on a single page.

# Local dev

- Remove `docker rmi -f tor-curl`
- Build: `docker build -t tor-curl .`
- Run interactive (debug): `docker run -it --rm -p 9050:9050 -p 9051:9051 tor-curl`
