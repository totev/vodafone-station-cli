# vodafone-station-cli
Access your Arris TG3442DE (aka Vodafone Station) from the comfort of the command line.

## Supported hardware
Currently only the following hardware/software is supported:
 - Arris TG3442DE running `AR01.02.068.11_092320_711.PC20.10`

## Inner workings
A request is send containing the cookie: currently `PHPSESSID` and `credential`. A `csrfNonce` is also being sent.

Used request headers:
```
Cookie: PHPSESSID=SOME_SESSION_ID; credential=SOME_STRING
csrfNonce: SOME_NONCE
```

## DOCSIS status





## Useful related projects:
 - [https://github.com/nox-x/TG3442DE-Teardown]
 - [https://github.com/cbruegg/packetloss-watchdog]
 - [https://github.com/Fluepke/vodafone-station-exporter]
 - [https://github.com/bitwiseshiftleft/sjcl]