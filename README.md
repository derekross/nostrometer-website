# nostrometer.com

Public site for [Nostrometer](https://nostrometer.com), the Nostr ecosystem's
measure of interoperability: every app discovered, ranked by real usage, rated
NIP-by-NIP.

The site is read-only. Ratings (kind 31986) and listings (kind 31990) are read
live from relays; usage counts and source-code claims come from static JSON
exported from the [nostrometer tooling](https://github.com/derekross/nostrometer).
Rating happens on [nostrhub.io](https://nostrhub.io/apps).

## Develop

```sh
npm install
npm run dev              # http://localhost:8080
npm run test             # tsc, eslint, vitest, build
npm run build            # dist/
npm run build:prerender  # dist/ with prerendered HTML + sitemap (needs relay access)
```

## Data

`public/data/metrics.json`, `public/data/claimed.json` and
`public/data/ratings.json` are generated from the tooling checkout at
`../nostrometer` (override with `NOSTROMETER_DIR`):

```sh
npm run sync-data
```

Re-run after `make ratings metrics claims` in the tooling repo and commit the
outputs. The ratings snapshot is the floor for the matrix: the site merges it
with a live relay read (newest revision per rater, app and NIP wins), so a slow
or missing relay can never make the matrix show fewer ratings than the last
crawl.

## Deploy

Pushes to `main` build with prerendering and rsync `dist/` to the production
host (see `.github/workflows/deploy.yml`; secrets `PROD_HOST`, `PROD_USER`,
`PROD_SSH_KEY`, `PROD_PATH`, `PROD_PORT`).

## License

MIT. Built from [MKStack](https://soapbox.pub/mkstack).
