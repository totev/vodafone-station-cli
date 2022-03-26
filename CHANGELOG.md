v1.2.6
---
- Added a new pretty printer for console output

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.2.5...v1.2.6

v1.2.5
---
- Updated dependencies
- Fixed technicolor restart issues

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.2.4...v1.2.5

v1.2.4
---
- Fix modulation value normalization on technicolor modems #23

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.2.3...v1.2.4

v1.2.3
---
- Add docsis values sharing via https://docsis-diagnose.totev.dev

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.2.2...v1.2.3

v1.2.2
---
- Respect log level

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.2.1...v1.2.2

v1.2.1
---
- Updated to the newest oclif version
- Cleaned up logging outputs

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.2.0...v1.2.1

v1.2.0
---
- Added basic diagnosing functionality based on the docsis values from [vodafonekabelforum.de](https://www.vodafonekabelforum.de/viewtopic.php?t=32353)

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.1.5...v1.1.5

v1.1.5
---
- Fixed the powerLevel parsing for arris modems - was dB(μV) but should have been dB(mV)

v1.1.4
---
- Add HTTP Referrer for Technicolor CGA4322DE Firmware: 2.0.17-IMS-KDG

v1.1.3
---
- Added support for Technicolor CGA6444VF
- Minor bugfixes
 
v1.1.2
---
- Bugfixes related to parallel promise resolution
- Updated telegraf configuration

v1.1.1
---
- Added support for Technicolor modems
- Abstracted all of the modem logic to support multiple brands as adapters
- Fixed timeout issues when modems take too long to response
- Updated dependencies
- Added automatic releases
