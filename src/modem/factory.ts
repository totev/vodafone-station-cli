import {Arris} from './arris-modem'
import {ModemInformation} from '../discovery'
import {ConsoleLogger, Log} from '../logger'
import type {Modem} from './modem'
import {Technicolor} from './technicolor-modem'

export function modemFactory(modemInfo: ModemInformation, logger: Log = new ConsoleLogger()): Modem {
  switch (modemInfo.deviceType) {
  case 'Arris':
    return new Arris(modemInfo.ipAddress, logger)
  case 'Technicolor':
    return new Technicolor(modemInfo.ipAddress, logger)
  default:
    throw new Error(`Unsupported modem ${modemInfo.deviceType}`)
  }
}
