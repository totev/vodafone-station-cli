vodafone-station-cli
====================

Access your Arris TG3442DE or Technicolor CGA4322DE, CGA6444VF (aka Vodafone Station) from the comfort of the command line.

![ci-status](https://github.com/totev/vodafone-station-cli/actions/workflows/main.yml/badge.svg)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![latest version](https://img.shields.io/github/v/release/totev/vodafone-station-cli.svg)](https://github.com/totev/vodafone-station-cli/releases)
[![npm](https://img.shields.io/npm/v/vodafone-station-cli)](https://www.npmjs.com/package/vodafone-station-cli)

<!-- toc -->
* [Features](#features)
* [Demo](#demo)
* [Supported hardware](#supported-hardware)
* [Notes](#notes)
* [Useful related projects:](#useful-related-projects)
* [Running from source](#running-from-source)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Features

* discover your vodafone station's IP in your local network
* Retrieve the current docsis connection state and transform it into JSON
* diagnose your docsis connection state to quickly detect abnormalities
* restart your vodafone station
* see your docsis connection information plotted in a web browser
* share your docsis connection information with others via URL

# Demo
<p align="center">

![](./usage.svg)

</p>

# Supported hardware

Currently the following hardware/software is supported:

- Arris TG3442DE running `AR01.02.068.11_092320_711.PC20.10`, `01.02.068.13.EURO.PC20`
- Technicolor CGA4322DE running `1.0.9-IMS-KDG`, `2.0.17-IMS-KDG`, `3.0.41-IMS-KDG`
- Technicolor CGA6444VF running firmware `19.3B57-1.0.41`

<details>
  <summary>Docsis data format</summary>

```json
{
    "downstream": [
        {
            "channelId": "1",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 55.4,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 114
        },
        {
            "channelId": "2",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 55,
            "lockStatus": "Locked",
            "snr": 36,
            "frequency": 130
        },
        {
            "channelId": "3",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 55.2,
            "lockStatus": "Locked",
            "snr": 36,
            "frequency": 138
        },
        {
            "channelId": "4",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 54.8,
            "lockStatus": "Locked",
            "snr": 36,
            "frequency": 146
        },
        {
            "channelId": "5",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 56.4,
            "lockStatus": "Locked",
            "snr": 38,
            "frequency": 602
        },
        {
            "channelId": "6",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 55.9,
            "lockStatus": "Locked",
            "snr": 37,
            "frequency": 618
        },
        {
            "channelId": "7",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 55.7,
            "lockStatus": "Locked",
            "snr": 37,
            "frequency": 626
        },
        {
            "channelId": "8",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 54.7,
            "lockStatus": "Locked",
            "snr": 37,
            "frequency": 642
        },
        {
            "channelId": "9",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 55.3,
            "lockStatus": "Locked",
            "snr": 37,
            "frequency": 650
        },
        {
            "channelId": "10",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 56.1,
            "lockStatus": "Locked",
            "snr": 38,
            "frequency": 658
        },
        {
            "channelId": "11",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 56.3,
            "lockStatus": "Locked",
            "snr": 38,
            "frequency": 666
        },
        {
            "channelId": "12",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 57.5,
            "lockStatus": "Locked",
            "snr": 39,
            "frequency": 674
        },
        {
            "channelId": "13",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 57.7,
            "lockStatus": "Locked",
            "snr": 38,
            "frequency": 682
        },
        {
            "channelId": "14",
            "channelType": "SC-QAM",
            "modulation": "256QAM",
            "powerLevel": 58.3,
            "lockStatus": "Locked",
            "snr": 39,
            "frequency": 690
        },
        {
            "channelId": "15",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 52.2,
            "lockStatus": "Locked",
            "snr": 34,
            "frequency": 698
        },
        {
            "channelId": "16",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 53.2,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 706
        },
        {
            "channelId": "17",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 53.3,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 714
        },
        {
            "channelId": "18",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 53.1,
            "lockStatus": "Locked",
            "snr": 34,
            "frequency": 722
        },
        {
            "channelId": "19",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 53.1,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 730
        },
        {
            "channelId": "20",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 54.2,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 738
        },
        {
            "channelId": "21",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 54.7,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 746
        },
        {
            "channelId": "22",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 53.8,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 754
        },
        {
            "channelId": "23",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 53.9,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 762
        },
        {
            "channelId": "24",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 54.1,
            "lockStatus": "Locked",
            "snr": 34,
            "frequency": 770
        },
        {
            "channelId": "25",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 54.5,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 778
        },
        {
            "channelId": "26",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 54.7,
            "lockStatus": "Locked",
            "snr": 34,
            "frequency": 786
        },
        {
            "channelId": "27",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 54.7,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 794
        },
        {
            "channelId": "28",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 54.3,
            "lockStatus": "Locked",
            "snr": 34,
            "frequency": 802
        },
        {
            "channelId": "29",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 53.9,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 810
        },
        {
            "channelId": "30",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 54.5,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 818
        },
        {
            "channelId": "31",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 54.1,
            "lockStatus": "Locked",
            "snr": 35,
            "frequency": 826
        },
        {
            "channelId": "32",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 53.1,
            "lockStatus": "Locked",
            "snr": 34,
            "frequency": 834
        }
    ],
    "downstreamOfdm": [
        {
            "channelId": "33",
            "channelType": "OFDM",
            "modulation": "1024QAM",
            "powerLevel": 56.2,
            "lockStatus": "Locked",
            "snr": 40,
            "frequencyStart": 151,
            "frequencyEnd": 324
        }
    ],
    "upstream": [
        {
            "channelId": "3",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 111,
            "lockStatus": "ACTIVE",
            "snr": 0,
            "frequency": 37
        },
        {
            "channelId": "4",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 111,
            "lockStatus": "ACTIVE",
            "snr": 0,
            "frequency": 31
        },
        {
            "channelId": "1",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 111,
            "lockStatus": "ACTIVE",
            "snr": 0,
            "frequency": 51
        },
        {
            "channelId": "2",
            "channelType": "SC-QAM",
            "modulation": "64QAM",
            "powerLevel": 111,
            "lockStatus": "ACTIVE",
            "snr": 0,
            "frequency": 45
        }
    ],
    "upstreamOfdma": [
        {
            "channelId": "9",
            "channelType": "OFDMA",
            "modulation": "16_QAM",
            "powerLevel": 107,
            "lockStatus": "SUCCESS",
            "snr": 0,
            "frequencyStart": 29.8,
            "frequencyEnd": 64.8
        }
    ],
    "time": "2021-10-23T13:06:23.988Z"
}
```
</details>

<details>
  <summary>Table printer format</summary>

```
    Downstream
    +----+----------+------------+-------+-----------+-------------+-----+
    | ID | Ch. Type | Modulation | Power | Frequency | Lock status | SNR |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 1  | SC-QAM   | 256QAM     | 55.1  | 114       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 2  | SC-QAM   | 256QAM     | 54.7  | 130       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 3  | SC-QAM   | 256QAM     | 54.8  | 138       | Locked      | 36  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 4  | SC-QAM   | 256QAM     | 54.6  | 146       | Locked      | 36  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 5  | SC-QAM   | 256QAM     | 57    | 602       | Locked      | 38  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 6  | SC-QAM   | 256QAM     | 57.3  | 618       | Locked      | 39  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 7  | SC-QAM   | 256QAM     | 57.7  | 626       | Locked      | 38  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 8  | SC-QAM   | 256QAM     | 58.5  | 642       | Locked      | 39  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 9  | SC-QAM   | 256QAM     | 58.3  | 650       | Locked      | 39  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 10 | SC-QAM   | 256QAM     | 58.3  | 658       | Locked      | 39  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 11 | SC-QAM   | 256QAM     | 58.1  | 666       | Locked      | 38  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 12 | SC-QAM   | 256QAM     | 58.8  | 674       | Locked      | 39  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 13 | SC-QAM   | 256QAM     | 58.8  | 682       | Locked      | 39  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 14 | SC-QAM   | 256QAM     | 59.4  | 690       | Locked      | 39  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 15 | SC-QAM   | 64QAM      | 53    | 698       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 16 | SC-QAM   | 64QAM      | 54.1  | 706       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 17 | SC-QAM   | 64QAM      | 54.2  | 714       | Locked      | 34  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 18 | SC-QAM   | 64QAM      | 53.8  | 722       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 19 | SC-QAM   | 64QAM      | 53.9  | 730       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 20 | SC-QAM   | 64QAM      | 54.9  | 738       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 21 | SC-QAM   | 64QAM      | 55.3  | 746       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 22 | SC-QAM   | 64QAM      | 54.5  | 754       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 23 | SC-QAM   | 64QAM      | 54.5  | 762       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 24 | SC-QAM   | 64QAM      | 54.5  | 770       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 25 | SC-QAM   | 64QAM      | 55    | 778       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 26 | SC-QAM   | 64QAM      | 55    | 786       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 27 | SC-QAM   | 64QAM      | 54.9  | 794       | Locked      | 34  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 28 | SC-QAM   | 64QAM      | 54.4  | 802       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 29 | SC-QAM   | 64QAM      | 54.1  | 810       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 30 | SC-QAM   | 64QAM      | 54.5  | 818       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 31 | SC-QAM   | 64QAM      | 54.5  | 826       | Locked      | 35  |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 32 | SC-QAM   | 64QAM      | 53.7  | 834       | Locked      | 34  |
    +----+----------+------------+-------+-----------+-------------+-----+
    
    Downstream OFDM
    +----+----------+------------+-------+-----------+-------------+-----+
    | ID | Ch. Type | Modulation | Power | Frequency | Lock status | SNR |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 33 | OFDM     | 1024QAM    | 56.1  | 151-324   | Locked      | 39  |
    +----+----------+------------+-------+-----------+-------------+-----+
    
    Upstream
    +----+----------+------------+-------+-----------+-------------+-----+
    | ID | Ch. Type | Modulation | Power | Frequency | Lock status | SNR |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 3  | SC-QAM   | 64QAM      | 110.3 | 37        | Locked      | 0   |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 4  | SC-QAM   | 32QAM      | 110.3 | 31        | Locked      | 0   |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 1  | SC-QAM   | 64QAM      | 110.3 | 51        | Locked      | 0   |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 2  | SC-QAM   | 64QAM      | 110.3 | 45        | Locked      | 0   |
    +----+----------+------------+-------+-----------+-------------+-----+
    
    Upstream OFDMA
    +----+----------+------------+-------+-----------+-------------+-----+
    | ID | Ch. Type | Modulation | Power | Frequency | Lock status | SNR |
    +----+----------+------------+-------+-----------+-------------+-----+
    | 9  | OFDMA    | 16_QAM     | 106.2 | 29.8-64.8 | SUCCESS     | 0   |
    +----+----------+------------+-------+-----------+-------------+-----+
```
</details>

# Notes

A full login and logout sequence is being done on every command execution.
You can provide a password either by setting the environment variable `VODAFONE_ROUTER_PASSWORD` in your shell, in a local `.env` file or by using the `-p` flag.

# Useful related projects:

- https://github.com/nox-x/TG3442DE-Teardown
- https://github.com/cbruegg/packetloss-watchdog
- https://github.com/Fluepke/vodafone-station-exporter
- https://github.com/bitwiseshiftleft/sjcl

Cable connection information/meaning:
- https://motorolacable.com/whitepapers/cable-connection

The Diagnose module is based on the guidelines/values provided by Meister Voda:
- https://www.vodafonekabelforum.de/viewtopic.php?t=32353

# Running from source
Clone this repository, install the dependencies via *yarn* and run `./bin/dev help`.
If you are interested in seeing a more verbose version of what is going on during execution, enable debug logging on a per command basis like so `env DEBUG=\* ./bin/dev docsis`.

# Usage
<!-- usage -->
```sh-session
$ npm install -g vodafone-station-cli
$ vodafone-station-cli COMMAND
running command...
$ vodafone-station-cli (--version)
vodafone-station-cli/1.2.7 darwin-arm64 node-v17.8.0
$ vodafone-station-cli --help [COMMAND]
USAGE
  $ vodafone-station-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`vodafone-station-cli diagnose`](#vodafone-station-cli-diagnose)
* [`vodafone-station-cli discover`](#vodafone-station-cli-discover)
* [`vodafone-station-cli docsis`](#vodafone-station-cli-docsis)
* [`vodafone-station-cli help [COMMAND]`](#vodafone-station-cli-help-command)
* [`vodafone-station-cli restart`](#vodafone-station-cli-restart)

## `vodafone-station-cli diagnose`

Diagnose the quality of the docsis connection.

```
USAGE
  $ vodafone-station-cli diagnose [-p <value>] [-w]

FLAGS
  -p, --password=<value>  router/modem password
  -w, --web               review the docsis values in a webapp

DESCRIPTION
  Diagnose the quality of the docsis connection.

EXAMPLES
  $ vodafone-station-cli diagnose
```

_See code: [src/commands/diagnose.ts](https://github.com/totev/vodafone-station-cli/blob/v1.2.7/src/commands/diagnose.ts)_

## `vodafone-station-cli discover`

Try to discover a cable modem in the network

```
USAGE
  $ vodafone-station-cli discover

DESCRIPTION
  Try to discover a cable modem in the network

EXAMPLES
  $ vodafone-station-cli discover
```

_See code: [src/commands/discover.ts](https://github.com/totev/vodafone-station-cli/blob/v1.2.7/src/commands/discover.ts)_

## `vodafone-station-cli docsis`

Get the current docsis status as reported by the modem in a JSON format.

```
USAGE
  $ vodafone-station-cli docsis [-p <value>] [-f] [-w]

FLAGS
  -f, --file              write out a report file under ./reports/${CURRENT_UNIX_TIMESTAMP}_docsisStatus.json
  -p, --password=<value>  router/modem password
  -w, --web               review the docsis values in a webapp

DESCRIPTION
  Get the current docsis status as reported by the modem in a JSON format.

EXAMPLES
  $ vodafone-station-cli docsis -p PASSWORD
  {JSON data}
```

_See code: [src/commands/docsis.ts](https://github.com/totev/vodafone-station-cli/blob/v1.2.7/src/commands/docsis.ts)_

## `vodafone-station-cli help [COMMAND]`

Display help for vodafone-station-cli.

```
USAGE
  $ vodafone-station-cli help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for vodafone-station-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.11/src/commands/help.ts)_

## `vodafone-station-cli restart`

Restart the router/modem

```
USAGE
  $ vodafone-station-cli restart [-p <value>]

FLAGS
  -p, --password=<value>  router/modem password

DESCRIPTION
  Restart the router/modem

EXAMPLES
  $ vodafone-station-cli restart -p PASSWORD
```

_See code: [src/commands/restart.ts](https://github.com/totev/vodafone-station-cli/blob/v1.2.7/src/commands/restart.ts)_
<!-- commandsstop -->
