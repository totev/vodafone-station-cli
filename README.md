vodafone-station-cli
====================

Access your Arris TG3442DE or Technicolor CGA4322DE, CGA6444VF (aka Vodafone Station) from the comfort of the command line.

![ci-status](https://github.com/totev/vodafone-station-cli/actions/workflows/main.yml/badge.svg)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![latest version](https://img.shields.io/github/v/release/totev/vodafone-station-cli.svg)](https://github.com/totev/vodafone-station-cli/releases)

<!-- toc -->
* [Supported hardware](#supported-hardware)
* [Notes](#notes)
* [Useful related projects:](#useful-related-projects)
* [Local usage](#local-usage)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

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

# Local usage
Clone this repository, install the dependencies via *yarn* and run `./bin/dev help`.

# Usage
<!-- usage -->
```sh-session
$ npm install -g vodafone-station-cli
$ vodafone-station-cli COMMAND
running command...
$ vodafone-station-cli (--version)
vodafone-station-cli/1.2.0 darwin-arm64 node-v17.5.0
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
  $ vodafone-station-cli diagnose [-p <value>]

FLAGS
  -p, --password=<value>  router/modem password

DESCRIPTION
  Diagnose the quality of the docsis connection.

EXAMPLES
  $ vodafone-station-cli diagnose
```

_See code: [dist/commands/diagnose.ts](https://github.com/totev/vodafone-station-cli/blob/v1.2.0/dist/commands/diagnose.ts)_

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

_See code: [dist/commands/discover.ts](https://github.com/totev/vodafone-station-cli/blob/v1.2.0/dist/commands/discover.ts)_

## `vodafone-station-cli docsis`

Get the current docsis status as reported by the modem in a JSON format.

```
USAGE
  $ vodafone-station-cli docsis [-p <value>] [-f]

FLAGS
  -f, --file              write out a report file
  -p, --password=<value>  router/modem password

DESCRIPTION
  Get the current docsis status as reported by the modem in a JSON format.

EXAMPLES
  $ vodafone-station-cli docsis -p PASSWORD
  JSON data
```

_See code: [dist/commands/docsis.ts](https://github.com/totev/vodafone-station-cli/blob/v1.2.0/dist/commands/docsis.ts)_

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

_See code: [dist/commands/restart.ts](https://github.com/totev/vodafone-station-cli/blob/v1.2.0/dist/commands/restart.ts)_
<!-- commandsstop -->
