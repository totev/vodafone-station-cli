import type {
  Diagnose, DiagnosedDocsis31ChannelStatus, DiagnosedDocsisChannelStatus, DiagnosedDocsisStatus, DocsisChannelType, DocsisStatus, Modulation,
} from './modem';

import {BAD_MODEM_POWER_LEVEL} from './constants';

export interface Deviation {
  channelType?: DocsisChannelType
  check(powerLevel: number):Diagnose;
  modulation: 'Unknown' | Modulation;
}

// based on https://www.vodafonekabelforum.de/viewtopic.php?t=32353
export default class DocsisDiagnose {
  constructor(private docsisStatus:DocsisStatus) {}

  get diagnose(): DiagnosedDocsisStatus {
    return {
      downstream: this.checkDownstream(),
      downstreamOfdm: this.checkOfdmDownstream(),
      time: this.docsisStatus.time,
      upstream: this.checkUpstream(),
      upstreamOfdma: this.checkOfdmaUpstream(),
    }
  }

  checkDownstream(): DiagnosedDocsisChannelStatus[] {
    return this.docsisStatus.downstream
    .map(channel => ({...channel, diagnose: downstreamDeviation(channel)}))
  }

  checkDownstreamSNR(): DiagnosedDocsisChannelStatus[] {
    return this.docsisStatus.downstream
    .map(channel => ({...channel, diagnose: checkSignalToNoise(channel)}))
  }

  checkOfdmaUpstream(): DiagnosedDocsis31ChannelStatus[] {
    return this.docsisStatus.upstreamOfdma
    .map(channel => ({...channel, diagnose: upstreamDeviation(channel)}))
  }

  checkOfdmDownstream(): DiagnosedDocsis31ChannelStatus[] {
    return this.docsisStatus.downstreamOfdm
    .map(channel => ({...channel, diagnose: downstreamDeviation(channel)}))
  }

  checkOfdmDownstreamSNR(): DiagnosedDocsis31ChannelStatus[] {
    return this.docsisStatus.downstreamOfdm
    .map(channel => ({...channel, diagnose: checkSignalToNoise(channel)}))
  }

  checkUpstream(): DiagnosedDocsisChannelStatus[] {
    return this.docsisStatus.upstream
    .map(channel => ({...channel, diagnose: upstreamDeviation(channel)}))
  }

  hasDeviations(): boolean {
    return [
      this.checkDownstream(),
      this.checkDownstreamSNR(),
      this.checkOfdmDownstream(),
      this.checkOfdmDownstreamSNR(),
      this.checkUpstream(),
      this.checkOfdmaUpstream(),
    ]
    .flat()
    .some(({diagnose}) => diagnose.deviation)
  }

  printDeviationsConsole(): string {
    if (this.hasDeviations() === false) {
      return colorize('green', 'Hooray no deviations found!')
    }

    const down
      = [...this.checkDownstream(), ...this.checkOfdmDownstream()]
      .filter(downstream => downstream.diagnose.deviation)
      .map(down =>
        colorize(down.diagnose.color, `ch${down.channelId}pl`))
    const downSnr
      = [...this.checkDownstreamSNR(),
        ...this.checkOfdmDownstreamSNR()]
      .filter(downstream => downstream.diagnose.deviation)
      .map(down =>
        colorize(down.diagnose.color, `ch${down.channelId}snr`))
    const up
      = [...this.diagnose.upstream, ...this.diagnose.upstreamOfdma]
      .filter(upstream => upstream.diagnose.deviation)
      .map(upstream =>
        colorize(upstream.diagnose.color, `ch${upstream.channelId}pl`)).join(', ')

    return [
      'Legend: pl = power level | snr = signal to noise ratio',
      `Colors:  ${colorize(FixWithinOneMonth.color, FixWithinOneMonth.description)} | ${colorize(FixImmediately.color, FixImmediately.description)}`,
      `DOWN: ${[...down, ...downSnr].join(', ')}`,
      `UP: ${up}`,
    ].join('\n');
  }
}

export const SEVERITY_COLORS
= {
  green: '\u001B[32m',
  red: '\u001B[31m',
  yellow: '\u001B[33m',
}

export function colorize(severity: 'green' | 'red' | 'yellow', message: string): string {
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.green
  const colorStop = '\u001B[0m'
  return `${color}${message}${colorStop}`;
}

export class UpstreamDeviationSCQAM implements Deviation {
  channelType = 'SC-QAM' as const
  modulation = '64QAM' as const

  check(powerLevel: number): Diagnose {
    if (powerLevel <= 35)
      return FixImmediately
    if (powerLevel > 35 && powerLevel <= 37)
      return FixWithinOneMonth;
    if (powerLevel > 37 && powerLevel <= 41)
      return ToleratedDeviation;
    if (powerLevel > 41 && powerLevel <= 47)
      return CompliesToSpecifications;
    if (powerLevel > 47 && powerLevel <= 51)
      return ToleratedDeviation;
    if (powerLevel > 51 && powerLevel <= 53)
      return FixWithinOneMonth;
    if (powerLevel > 53)
      return FixImmediately

    throw new Error(`PowerLevel is not within supported range. PowerLevel: ${powerLevel}`);
  }
}

export class UpstreamDeviationOFDMA implements Deviation {
  channelType = 'OFDMA' as const
  modulation = '64QAM' as const

  check(powerLevel: number): Diagnose {
    if (powerLevel <= 38)
      return FixImmediately
    if (powerLevel > 38 && powerLevel <= 40)
      return FixWithinOneMonth;
    if (powerLevel > 40 && powerLevel <= 44)
      return ToleratedDeviation;
    if (powerLevel > 44 && powerLevel <= 47)
      return CompliesToSpecifications;
    if (powerLevel > 47 && powerLevel <= 48)
      return ToleratedDeviation;
    if (powerLevel > 48 && powerLevel <= 50)
      return FixWithinOneMonth;
    if (powerLevel > 50)
      return FixImmediately

    if (powerLevel === BAD_MODEM_POWER_LEVEL)
      return FixImmediately

    throw new Error(`PowerLevel is not within supported range. PowerLevel: ${powerLevel}`);
  }
}

export function  downstreamDeviation({modulation, powerLevel}:{modulation: Modulation, powerLevel: number}): Diagnose {
  const deviation = downstreamDeviationFactory(modulation);
  return deviation.check(powerLevel);
}

export class DownstreamDeviation64QAM implements Deviation {
  modulation = '64QAM' as const

  check(powerLevel: number): Diagnose {
    if (powerLevel >= -60 && powerLevel <= -14)
      return FixImmediately
    if (powerLevel > -14 && powerLevel <= -12)
      return FixWithinOneMonth;
    if (powerLevel > -12 && powerLevel <= -10)
      return ToleratedDeviation;
    if (powerLevel > -10 && powerLevel <= 7)
      return CompliesToSpecifications;
    if (powerLevel > 7 && powerLevel <= 12)
      return ToleratedDeviation;
    if (powerLevel > 12 && powerLevel <= 14)
      return FixWithinOneMonth;
    if (powerLevel >= 14.1)
      return FixImmediately

    throw new Error(`PowerLevel is not within supported range. PowerLevel: ${powerLevel}`);
  }
}

export class DownstreamDeviation256QAM implements Deviation {
  delegate = new DownstreamDeviation64QAM()
  modulation = '256QAM' as const

  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 6 <= -60 ? powerLevel : powerLevel - 6;
    return this.delegate.check(adjustedPowerLevel)
  }
}

export class DownstreamDeviation1024QAM implements Deviation {
  delegate = new DownstreamDeviation64QAM()
  modulation = '1024QAM' as const

  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 8 <= -60 ? powerLevel : powerLevel - 8;
    return this.delegate.check(adjustedPowerLevel)
  }
}
export class DownstreamDeviation2048QAM implements Deviation {
  delegate = new DownstreamDeviation64QAM()
  modulation = '2048QAM' as const

  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 10 <= -60 ? powerLevel : powerLevel - 10;
    return this.delegate.check(adjustedPowerLevel)
  }
}
export class DownstreamDeviation4096QAM implements Deviation {
  delegate = new DownstreamDeviation64QAM()
  modulation = '4096QAM' as const

  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 12 <= -60 ? powerLevel : powerLevel - 12;
    return this.delegate.check(adjustedPowerLevel)
  }
}

export class DownstreamDeviationUnknown implements Deviation {
  modulation = 'Unknown' as const

  check(_powerLevel: number): Diagnose {
    return FixImmediately;
  }
}

export const FixImmediately: Diagnose = {
  color: 'red',
  description: 'Fix immediately',
  deviation: true,
}
export const CompliesToSpecifications: Diagnose = {
  color: 'green',
  description: 'Complies to specifications',
  deviation: false,
}
export const ToleratedDeviation: Diagnose = {
  color: 'green',
  description: 'Tolerated deviation',
  deviation: false,
}
export const FixWithinOneMonth: Diagnose = {
  color: 'yellow',
  description: 'Fix within one Month',
  deviation: true,
}

export function downstreamDeviationFactory(modulation: 'Unknown' | Modulation): Deviation {
  switch (modulation) {
  case '64QAM': {
    return new DownstreamDeviation64QAM();
  }

  case '256QAM': {
    return new DownstreamDeviation256QAM();
  }

  case '1024QAM': {
    return new DownstreamDeviation1024QAM();
  }

  case '2048QAM': {
    return new DownstreamDeviation2048QAM();
  }

  case '4096QAM': {
    return new DownstreamDeviation4096QAM();
  }

  case 'Unknown': {
    return new DownstreamDeviationUnknown();
  }

  default: {
    throw new Error(`Unsupported modulation ${modulation}`)
  }
  }
}

export function upstreamDeviationFactory(channelType: DocsisChannelType): Deviation {
  switch (channelType) {
  case 'OFDMA': {
    return new UpstreamDeviationOFDMA()
  }

  case 'SC-QAM': {
    return new UpstreamDeviationSCQAM();
  }

  default: {
    throw new Error(`Unsupported channel type ${channelType}`)
  }
  }
}

export function upstreamDeviation({channelType, powerLevel}:{channelType: DocsisChannelType, powerLevel: number}): Diagnose {
  const deviation = upstreamDeviationFactory(channelType);
  return deviation.check(powerLevel);
}

export function checkSignalToNoise({modulation, snr}:{modulation: Modulation; snr: number,}): Diagnose {
  let snrOffsetForModulation;
  switch (modulation) {
  case '64QAM': {
    snrOffsetForModulation = 0;
    break;
  }

  case '256QAM': {
    snrOffsetForModulation = 6;
    break;
  }

  case '1024QAM': {
    snrOffsetForModulation = 12;
    break;
  }

  case '2048QAM': {
    snrOffsetForModulation = 15;
    break;
  }

  case '4096QAM': {
    snrOffsetForModulation = 18;
    break;
  }

  case 'Unknown': {
    // For unknown modulation, we can't determine proper SNR deviation
    // so we return FixImmediately to indicate a problem
    return FixImmediately;
  }

  default: {
    throw new Error(`Unsupported modulation ${modulation}`)
  }
  }

  const adjustedSNR = snr - snrOffsetForModulation;

  if (adjustedSNR <= 24)
    return FixImmediately
  if (adjustedSNR > 24 && adjustedSNR <= 26)
    return FixWithinOneMonth;
  if (adjustedSNR > 26 && adjustedSNR <= 27)
    return ToleratedDeviation;
  if (adjustedSNR > 27)
    return CompliesToSpecifications;

  throw new Error(`SignalToNoiseRation is not within supported range. SNR: ${snr}`);
}
