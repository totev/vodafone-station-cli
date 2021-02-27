vodafone-station-cli
====================

Access your Arris TG3442DE (aka Vodafone Station) from the comfort of the command line.

![ci-status](https://github.com/totev/vodafone-station-cli/actions/workflows/main.yml/badge.svg)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/vodafone-station-cli.svg)](https://npmjs.org/package/vodafone-station-cli)
[![Codecov](https://codecov.io/gh/totev/vodafone-station-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/totev/vodafone-station-cli)
[![Downloads/week](https://img.shields.io/npm/dw/vodafone-station-cli.svg)](https://npmjs.org/package/vodafone-station-cli)
[![License](https://img.shields.io/npm/l/vodafone-station-cli.svg)](https://github.com/totev/vodafone-station-cli/blob/master/package.json)

# Supported hardware

Currently only the following hardware/software is supported:

- Arris TG3442DE running `AR01.02.068.11_092320_711.PC20.10`

# Notes

A full login and logout sequence is being done on every command execution.

<!-- toc -->
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
vodafone-station-cli/1.0.0 darwin-x64 node-v14.15.5
$ vodafone-station-cli --help [COMMAND]
USAGE
  $ vodafone-station-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`vodafone-station-cli hello [FILE]`](#vodafone-station-cli-hello-file)
* [`vodafone-station-cli help [COMMAND]`](#vodafone-station-cli-help-command)

## `vodafone-station-cli hello [FILE]`

describe the command here

```
USAGE
  $ vodafone-station-cli hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ vodafone-station-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/totev/vodafone-station-cli/blob/v1.0.0/src/commands/hello.ts)_

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
<!-- commandsstop -->


## Useful related projects:

- https://github.com/nox-x/TG3442DE-Teardown
- https://github.com/cbruegg/packetloss-watchdog
- https://github.com/Fluepke/vodafone-station-exporter
- https://github.com/bitwiseshiftleft/sjcl