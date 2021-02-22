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

You can get the current docsis status as reported by the modem in a JSON format.

```
yarn install
npx ts-node src/index.ts --password "ROUTER_PASSWORD" --docsis
```

<details>
  <summary>Result JSON</summary>

```json
{
	"downstream": [
		{
			"ChannelType": "OFDM",
			"Modulation": "256QAM",
			"Frequency": "151~324",
			"ChannelID": "33",
			"PowerLevel": "-3.9/56.1",
			"SNRLevel": "0",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 114,
			"PowerLevel": "-5.4/54.6",
			"SNRLevel": 35.6,
			"Modulation": "256QAM",
			"ChannelID": "1",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 602,
			"PowerLevel": "-3.2/56.8",
			"SNRLevel": 39,
			"Modulation": "256QAM",
			"ChannelID": "5",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 130,
			"PowerLevel": "-5.8/54.2",
			"SNRLevel": 35.8,
			"Modulation": "256QAM",
			"ChannelID": "2",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 818,
			"PowerLevel": "-6.5/53.5",
			"SNRLevel": 35,
			"Modulation": "64QAM",
			"ChannelID": "30",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 826,
			"PowerLevel": "-6.6/53.4",
			"SNRLevel": 35.5,
			"Modulation": "64QAM",
			"ChannelID": "31",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 834,
			"PowerLevel": "-7.6/52.4",
			"SNRLevel": 34.9,
			"Modulation": "64QAM",
			"ChannelID": "32",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 786,
			"PowerLevel": "-5.9/54.1",
			"SNRLevel": 35,
			"Modulation": "64QAM",
			"ChannelID": "26",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 794,
			"PowerLevel": "-6.1/53.9",
			"SNRLevel": 35,
			"Modulation": "64QAM",
			"ChannelID": "27",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 810,
			"PowerLevel": "-6.6/53.4",
			"SNRLevel": 35.5,
			"Modulation": "64QAM",
			"ChannelID": "29",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 802,
			"PowerLevel": "-6.6/53.4",
			"SNRLevel": 34.9,
			"Modulation": "64QAM",
			"ChannelID": "28",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 138,
			"PowerLevel": "-5.6/54.4",
			"SNRLevel": 35.8,
			"Modulation": "256QAM",
			"ChannelID": "3",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 626,
			"PowerLevel": "-2.6/57.4",
			"SNRLevel": 38.6,
			"Modulation": "256QAM",
			"ChannelID": "7",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 618,
			"PowerLevel": "-3.1/56.9",
			"SNRLevel": 38.6,
			"Modulation": "256QAM",
			"ChannelID": "6",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 778,
			"PowerLevel": "-6/54",
			"SNRLevel": 35.7,
			"Modulation": "64QAM",
			"ChannelID": "25",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 146,
			"PowerLevel": "-6/54",
			"SNRLevel": 36.4,
			"Modulation": "256QAM",
			"ChannelID": "4",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 650,
			"PowerLevel": "-1.9/58.1",
			"SNRLevel": 39,
			"Modulation": "256QAM",
			"ChannelID": "9",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 658,
			"PowerLevel": "-1.8/58.2",
			"SNRLevel": 40.4,
			"Modulation": "256QAM",
			"ChannelID": "10",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 666,
			"PowerLevel": "-2.4/57.6",
			"SNRLevel": 39,
			"Modulation": "256QAM",
			"ChannelID": "11",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 754,
			"PowerLevel": "-6.5/53.5",
			"SNRLevel": 35,
			"Modulation": "64QAM",
			"ChannelID": "22",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 762,
			"PowerLevel": "-6.3/53.7",
			"SNRLevel": 35,
			"Modulation": "64QAM",
			"ChannelID": "23",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 770,
			"PowerLevel": "-6.5/53.5",
			"SNRLevel": 35,
			"Modulation": "64QAM",
			"ChannelID": "24",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 746,
			"PowerLevel": "-5.8/54.2",
			"SNRLevel": 35.7,
			"Modulation": "64QAM",
			"ChannelID": "21",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 642,
			"PowerLevel": "-1.9/58.1",
			"SNRLevel": 39,
			"Modulation": "256QAM",
			"ChannelID": "8",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 674,
			"PowerLevel": "-1.6/58.4",
			"SNRLevel": 39,
			"Modulation": "256QAM",
			"ChannelID": "12",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 698,
			"PowerLevel": "-7.5/52.5",
			"SNRLevel": 34.9,
			"Modulation": "64QAM",
			"ChannelID": "15",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 706,
			"PowerLevel": "-6.6/53.4",
			"SNRLevel": 35.5,
			"Modulation": "64QAM",
			"ChannelID": "16",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 722,
			"PowerLevel": "-7/53",
			"SNRLevel": 35,
			"Modulation": "64QAM",
			"ChannelID": "18",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 682,
			"PowerLevel": "-1.7/58.3",
			"SNRLevel": 39,
			"Modulation": "256QAM",
			"ChannelID": "13",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 690,
			"PowerLevel": "-1.3/58.7",
			"SNRLevel": 39,
			"Modulation": "256QAM",
			"ChannelID": "14",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 714,
			"PowerLevel": "-6.8/53.2",
			"SNRLevel": 35,
			"Modulation": "64QAM",
			"ChannelID": "17",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 738,
			"PowerLevel": "-6.2/53.8",
			"SNRLevel": 35.7,
			"Modulation": "64QAM",
			"ChannelID": "20",
			"LockStatus": "Locked"
		},
		{
			"ChannelType": "SC-QAM",
			"Frequency": 730,
			"PowerLevel": "-7.2/52.8",
			"SNRLevel": 35,
			"Modulation": "64QAM",
			"ChannelID": "19",
			"LockStatus": "Locked"
		}
	],
	"upstream": [
		{
			"Frequency": 36,
			"PowerLevel": "49/109",
			"ChannelType": "SC-QAM",
			"ChannelID": "4",
			"Modulation": "64QAM",
			"LockStatus": "ACTIVE"
		},
		{
			"Frequency": 59,
			"PowerLevel": "47.5/107.5",
			"ChannelType": "SC-QAM",
			"ChannelID": "1",
			"Modulation": "64QAM",
			"LockStatus": "ACTIVE"
		},
		{
			"Frequency": 46,
			"PowerLevel": "49.5/109.5",
			"ChannelType": "SC-QAM",
			"ChannelID": "3",
			"Modulation": "64QAM",
			"LockStatus": "ACTIVE"
		},
		{
			"Frequency": 52,
			"PowerLevel": "47/107",
			"ChannelType": "SC-QAM",
			"ChannelID": "2",
			"Modulation": "32QAM",
			"LockStatus": "ACTIVE"
		}
	],
	"downstreamChannels": 33,
	"upstreamChannels": 4,
	"ofdmChannels": 1
}
```
</details>

## Restart router

```
yarn install
npx ts-node src/index.ts --password "ROUTER_PASSWORD" --restart
```

## Useful related projects:

- https://github.com/nox-x/TG3442DE-Teardown
- https://github.com/cbruegg/packetloss-watchdog
- https://github.com/Fluepke/vodafone-station-exporter
- https://github.com/bitwiseshiftleft/sjcl
