![ci-status](https://github.com/totev/vodafone-station-cli/actions/workflows/main.yml/badge.svg)

# vodafone-station-cli

Access your Arris TG3442DE (aka Vodafone Station) from the comfort of the command line.

## Supported hardware

Currently only the following hardware/software is supported:

- Arris TG3442DE running `AR01.02.068.11_092320_711.PC20.10`

## Inner workings

A request is send containing the cookie: currently `PHPSESSID` and `credential`. A `csrfNonce` is also being sent. A full login and logout sequence is being done on every command execution.

Used request headers:

```
Cookie: PHPSESSID=SOME_SESSION_ID; credential=SOME_STRING
csrfNonce: SOME_NONCE
```

## DOCSIS status

```
yarn install
npx ts-node src/index.ts --password "ROUTER_PASSWORD" --docsis
```

## Restart router

```
yarn install
npx ts-node src/index.ts --password "ROUTER_PASSWORD" --restart
```

## Useful related projects:

- [https://github.com/nox-x/TG3442DE-Teardown]
- [https://github.com/cbruegg/packetloss-watchdog]
- [https://github.com/Fluepke/vodafone-station-exporter]
- [https://github.com/bitwiseshiftleft/sjcl]
