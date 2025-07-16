v1.5.2
---
- **🚨 Critical Fix**: Fixed "Cannot find module 'tslib'" runtime error by moving `tslib` from devDependencies to dependencies


**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.5.1...v1.5.2

v1.5.1
---
- **Documentation updates**: Updated README.md with latest dependency versions  

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.5.0...v1.5.1

v1.5.0
---
- **IP Flag Support**: Added IP flag support across all commands for flexible modem/router address specification
- **Enhanced Discovery**: Improved modem discovery with support for custom IP addresses
- **Documentation**: Updated help text and examples for IP flag usage

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.4.0...v1.5.0

v1.4.0
---
- **🔐 HTTPS Support**: Added comprehensive HTTPS support for secure modem communication
- **Automatic Protocol Detection**: Smart discovery automatically tries both HTTP and HTTPS endpoints
- **HTTPS Cookie Management**: Integrated `HttpsCookieAgent` for secure cookie handling in HTTPS sessions
- **Protocol-Aware URLs**: Dynamic URL construction based on detected protocol support
- **Secure Authentication**: Login credentials transmitted over encrypted connections when HTTPS is available
- **Graceful Fallback**: Automatically falls back to HTTP when HTTPS is not supported
**New Dependencies**:
- Added `http-cookie-agent` for HTTPS cookie management

**Security Benefits**:
- Encrypted API communication when HTTPS is available
- Secure session management with encrypted cookies

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.3.0...v1.4.0

v1.3.0
---
- **Major dependency updates**: Updated all dependencies to their latest versions
- **ESLint 9 migration**: Migrated from legacy `.eslintrc` to modern `eslint.config.js` flat config format
- **Enhanced ES module support**: Updated Jest configuration to properly handle ES modules from updated dependencies
- **Security improvements**: Fixed security vulnerabilities in dependencies with `npm audit fix`
- **Removed deprecated packages**: Replaced deprecated `eslint-config-oclif-typescript` with modern alternatives
- **Improved linting**: Enhanced ESLint configuration to only lint source code, excluding tests and build artifacts
- **Build system modernization**: Updated build tools and configurations for better compatibility

**Breaking Changes**: 
- **Node.js 20+ required**: Updated minimum Node.js requirement from 18.x to 20.x due to updated dependencies
- Updated CI to use Node.js 20

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.2.11...v1.3.0

v1.2.8
---
- Updated dependencies

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.2.7...v1.2.8

v1.2.7
---
- Third party dependencies updated
- Fixed npm package contents

**Full Changelog**: https://github.com/totev/vodafone-station-cli/compare/v1.2.6...v1.2.7

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
