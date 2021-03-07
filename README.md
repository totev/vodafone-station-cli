vodafone-station-cli
====================

Access your Arris TG3442DE (aka Vodafone Station) from the comfort of the command line.

![ci-status](https://github.com/totev/vodafone-station-cli/actions/workflows/main.yml/badge.svg)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

# Supported hardware

Currently only the following hardware/software is supported:

- Arris TG3442DE running `AR01.02.068.11_092320_711.PC20.10`

# Notes

A full login and logout sequence is being done on every command execution.

<!-- toc -->
* [Supported hardware](#supported-hardware)
* [Notes](#notes)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g vodafone-station-cli
$ vodafone-station-cli COMMAND
running command...
$ vodafone-station-cli (-v|--version|version)
vodafone-station-cli/1.0.0 darwin-arm64 node-v15.11.0
$ vodafone-station-cli --help [COMMAND]
USAGE
  $ vodafone-station-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`vodafone-station-cli docsis`](#vodafone-station-cli-docsis)
* [`vodafone-station-cli help [COMMAND]`](#vodafone-station-cli-help-command)
* [`vodafone-station-cli restart`](#vodafone-station-cli-restart)

## `vodafone-station-cli docsis`

Get the current docsis status as reported by the modem in a JSON format.

```
USAGE
  $ vodafone-station-cli docsis

OPTIONS
  -f, --file               write out a report file
  -p, --password=password  router/modem password

EXAMPLE
  $ vodafone-station-cli docsis -p PASSWORD
  JSON data
```

_See code: [src/commands/docsis.ts](https://github.com/totev/vodafone-station-cli/blob/v1.0.0/src/commands/docsis.ts)_

## `vodafone-station-cli help [COMMAND]`

display help for vodafone-station-cli

```
USAGE
  $ vodafone-station-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `vodafone-station-cli restart`

Restart the router/modem

```
USAGE
  $ vodafone-station-cli restart

OPTIONS
  -p, --password=password  router/modem password

EXAMPLE
  $ vodafone-station-cli restart -p PASSWORD
```

_See code: [src/commands/restart.ts](https://github.com/totev/vodafone-station-cli/blob/v1.0.0/src/commands/restart.ts)_
<!-- commandsstop -->


## Useful related projects:

- https://github.com/nox-x/TG3442DE-Teardown
- https://github.com/cbruegg/packetloss-watchdog
- https://github.com/Fluepke/vodafone-station-exporter
- https://github.com/bitwiseshiftleft/sjcl
