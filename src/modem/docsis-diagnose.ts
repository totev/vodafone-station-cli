import { BAD_MODEM_POWER_LEVEL } from "./constants";
import type { Diagnose, DiagnosedDocsis31ChannelStatus, DiagnosedDocsisChannelStatus, DiagnosedDocsisStatus, DocsisChannelType, DocsisStatus, Modulation } from "./modem";

export interface Deviation{
  channelType?: DocsisChannelType
  modulation: Modulation;
  check(powerLevel: number):Diagnose;
}

// based on https://www.vodafonekabelforum.de/viewtopic.php?t=32353
export default class DocsisDiagnose{

  constructor(private docsisStatus:DocsisStatus) {
  }

  get diagnose(): DiagnosedDocsisStatus{
    return {
      time: this.docsisStatus.time,
      downstream: this.checkDownstream(),
      downstreamOfdm: this.checkOfdmDownstream(),
      upstream: this.checkUpstream(),
      upstreamOfdma: this.checkOfdmaUpstream()
    }
  }

  checkDownstream(): DiagnosedDocsisChannelStatus[]{
    return this.docsisStatus.downstream
      .map(channel => {
        return { ...channel, diagnose: downstreamDeviation(channel) }
      })
  }

  checkDownstreamSNR(): DiagnosedDocsisChannelStatus[]{
    return this.docsisStatus.downstream
      .map(channel => {
        return { ...channel, diagnose: checkSignalToNoise(channel) }
      })
  }

  checkOfdmDownstreamSNR(): DiagnosedDocsis31ChannelStatus[]{
    return this.docsisStatus.downstreamOfdm
      .map(channel => {
        return { ...channel, diagnose: checkSignalToNoise(channel) }
      })
  }
  checkOfdmDownstream(): DiagnosedDocsis31ChannelStatus[]{
    return this.docsisStatus.downstreamOfdm
      .map(channel => {
        return { ...channel, diagnose: downstreamDeviation(channel) }
      })
  }
  checkUpstream(): DiagnosedDocsisChannelStatus[]{
    return this.docsisStatus.upstream
      .map(channel => {
        return { ...channel, diagnose: upstreamDeviation(channel) }
      })
  }
  checkOfdmaUpstream(): DiagnosedDocsis31ChannelStatus[]{
    return this.docsisStatus.upstreamOfdma
      .map(channel => {
        return { ...channel, diagnose: upstreamDeviation(channel) }
      })
  }

  hasDeviations(): boolean{
    return !![
      this.checkDownstream(),
      this.checkDownstreamSNR(),
      this.checkOfdmDownstream(),
      this.checkOfdmDownstreamSNR(),
      this.checkUpstream(),
      this.checkOfdmaUpstream()
    ]
      .flat()
      .find(({diagnose}) => diagnose.deviation)
  }

  printDeviationsConsole(): any{
    if (this.hasDeviations() === false) {
      return colorize("green", "Hooray no deviations found!")
    }

    const down =
      [...this.checkDownstream(), ...this.checkOfdmDownstream()]
        .filter(downstream => downstream.diagnose.deviation)
        .map(down =>
          colorize(down.diagnose.color, `ch${down.channelId}pl`)
        )
    const downSnr =
      [...this.checkDownstreamSNR(),
        ...this.checkOfdmDownstreamSNR()]
        .filter(downstream => downstream.diagnose.deviation)
        .map(down =>
          colorize(down.diagnose.color, `ch${down.channelId}snr`)
        )
    const up =
      [...this.diagnose.upstream, ...this.diagnose.upstreamOfdma]
        .filter(upstream => upstream.diagnose.deviation)
        .map(upstream =>
          colorize(upstream.diagnose.color, `ch${upstream.channelId}pl`)
        ).join(", ")
    
    return [
      "Legend: pl = power level | snr = signal to noise ration",
      `Colors:  ${colorize(FixWithinOneMonth.color, FixWithinOneMonth.description)} | ${colorize(FixImmediately.color, FixImmediately.description)}`,
      `DOWN: ${[...down, ...downSnr].join(", ")}`,
      `UP: ${up}`
    ].join("\n");
  }
}

export const SEVERITY_COLORS =
{
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
} 

export function colorize(severity: "green"|"yellow"|"red", message: string): string{
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS["green"]
  const colorStop = '\x1b[0m'
  return `${color}${message}${colorStop}`;
}


export class UpstreamDeviationSCQAM implements Deviation{
  modulation = "64QAM" as const
  channelType = "SC-QAM" as const
  
  check(powerLevel: number): Diagnose {
    if (powerLevel <= 35)
      return FixImmediately
    if (35 < powerLevel && powerLevel <= 37)
      return FixWithinOneMonth;
    if (37 < powerLevel && powerLevel <= 41)
      return ToleratedDeviation;
    if (41 < powerLevel && powerLevel <= 47)
      return CompliesToSpecifications;
    if (47 < powerLevel && powerLevel <= 51)
      return ToleratedDeviation;
    if (51 < powerLevel && powerLevel <= 53)
      return FixWithinOneMonth;
    if ( 53 < powerLevel)
      return FixImmediately
    
    throw new Error(`PowerLevel is not within supported range. PowerLevel: ${powerLevel}`);
  }
}

export class UpstreamDeviationOFDMA implements Deviation{
  modulation = "64QAM" as const
  channelType = "OFDMA" as const

  check(powerLevel: number): Diagnose {
    if (powerLevel <= 38)
      return FixImmediately
    if (38 < powerLevel && powerLevel <= 40)
      return FixWithinOneMonth;
    if (40 < powerLevel && powerLevel <= 44)
      return ToleratedDeviation;
    if (44 < powerLevel && powerLevel <= 47)
      return CompliesToSpecifications;
    if (47 < powerLevel && powerLevel <= 48)
      return ToleratedDeviation;
    if (48 < powerLevel && powerLevel <= 50)
      return FixWithinOneMonth;
    if ( 50 < powerLevel)
      return FixImmediately

    if (powerLevel === BAD_MODEM_POWER_LEVEL)
      return FixImmediately
    
    throw new Error(`PowerLevel is not within supported range. PowerLevel: ${powerLevel}`);
  }
}

export function  downstreamDeviation({ modulation, powerLevel }:{modulation: Modulation, powerLevel: number}): Diagnose {
  const deviation = downstreamDeviationFactory(modulation);
  return deviation.check(powerLevel);
}

export class DownstreamDeviation64QAM implements Deviation{
  modulation = "64QAM" as const
  
  check(powerLevel: number): Diagnose {
    if (-60 <= powerLevel && powerLevel <= -14)
      return FixImmediately
    if (-14 < powerLevel && powerLevel <= -12)
      return FixWithinOneMonth;
    if (-12 < powerLevel && powerLevel <= -10)
      return ToleratedDeviation;
    if (-10 < powerLevel && powerLevel <= 7)
      return CompliesToSpecifications;
    if (7 < powerLevel && powerLevel <= 12)
      return ToleratedDeviation;
    if (12 < powerLevel && powerLevel <= 14)
      return FixWithinOneMonth;
    if ( 14.1 <= powerLevel)
      return FixImmediately
    
    throw new Error(`PowerLevel is not within supported range. PowerLevel: ${powerLevel}`);
  }
}

export class DownstreamDeviation256QAM implements Deviation {
  modulation = "256QAM" as const
  delegate = new DownstreamDeviation64QAM()
    
  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 6 <= -60 ? powerLevel : powerLevel - 6;
    return this.delegate.check(adjustedPowerLevel)
  }
}

export class DownstreamDeviation1024QAM implements Deviation {
  modulation = "1024QAM" as const
  delegate = new DownstreamDeviation64QAM()
    
  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 8 <= -60 ? powerLevel : powerLevel - 8;
    return this.delegate.check(adjustedPowerLevel)
  }
}
export class DownstreamDeviation2048QAM implements Deviation {
  modulation = "2048QAM" as const
  delegate = new DownstreamDeviation64QAM()
    
  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 10<= -60 ? powerLevel : powerLevel -10;
    return this.delegate.check(adjustedPowerLevel)
  }
}
export class DownstreamDeviation4096QAM implements Deviation {
  modulation = "4096QAM" as const
  delegate = new DownstreamDeviation64QAM()
    
  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 12<= -60 ? powerLevel : powerLevel -12;
    return this.delegate.check(adjustedPowerLevel)
  }
}

export class DownstreamDeviationUnknown implements Deviation {
  modulation = "UNKNOWN" as any
  check(powerLevel: number): Diagnose {
    return FixImmediately;
  }
}

export const FixImmediately: Diagnose = {
  description : "Fix immediately",
  deviation: true,
  color:"red",
}
export const CompliesToSpecifications: Diagnose ={
  description :"Complies to specifications",
  deviation: false,
  color:"green"
}
export const ToleratedDeviation: Diagnose = {
  description :"Tolerated deviation",
  deviation: false,
  color:"green"
}
export const FixWithinOneMonth: Diagnose = {
  description :"Fix within one Month",
  deviation: true,
  color:"yellow"
}

export function downstreamDeviationFactory(modulation: Modulation | "UNKNOWN"): Deviation {
  switch (modulation) {
  case "64QAM":
    return new DownstreamDeviation64QAM();
  case "256QAM":
    return new DownstreamDeviation256QAM();
  case "1024QAM":
    return new DownstreamDeviation1024QAM();
  case "2048QAM":
    return new DownstreamDeviation2048QAM();
  case "4096QAM":
    return new DownstreamDeviation4096QAM();
  case "UNKNOWN":
    return new DownstreamDeviationUnknown();
  default:
    throw new Error(`Unsupported modulation ${modulation}`)
  }
}
  
export function upstreamDeviationFactory(channelType: DocsisChannelType): Deviation {
  switch (channelType) {
  case "SC-QAM":
    return new UpstreamDeviationSCQAM();
  case "OFDMA":
    return new UpstreamDeviationOFDMA()
  default:
    throw new Error(`Unsupported channel type ${channelType}`)
  }}

export function upstreamDeviation({ channelType, powerLevel }:{channelType: DocsisChannelType, powerLevel: number}): Diagnose {
  const deviation = upstreamDeviationFactory(channelType);
  return deviation.check(powerLevel);
}

export function checkSignalToNoise({snr, modulation }:{ snr: number, modulation: Modulation }): Diagnose {
  let snrOffsetForModulation;
  switch (modulation) {
  case "64QAM":
    snrOffsetForModulation = 0;
    break;
  case "256QAM":
    snrOffsetForModulation = 6;
    break;
  case "1024QAM":
    snrOffsetForModulation = 12;
    break;
  case "2048QAM":
    snrOffsetForModulation = 15;
    break;
  case "4096QAM":
    snrOffsetForModulation = 18;
    break;
  default:
    throw new Error(`Unsupported modulation ${modulation}`)
  }

  const adjustedSNR = snr - snrOffsetForModulation;
  
  if (adjustedSNR <= 24)
    return FixImmediately
  if (24 < adjustedSNR && adjustedSNR <= 26)
    return FixWithinOneMonth;
  if (26 < adjustedSNR && adjustedSNR <= 27)
    return ToleratedDeviation;
  if (27 < adjustedSNR)
    return CompliesToSpecifications;
    
  throw new Error(`SignalToNoiseRation is not within supported range. SNR: ${snr}`);
}