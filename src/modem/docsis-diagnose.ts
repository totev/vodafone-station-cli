import type { Diagnose, DiagnosedDocsis31ChannelStatus, DiagnosedDocsisChannelStatus, DocsisChannelType, DocsisStatus, HumanizedDocsisChannelStatus, Modulation } from "./modem";


export const enum StatusClassification{
  IMMINENT_REPAIR=-1,
}

export interface Deviation{
  channelType?: DocsisChannelType
  modulation: Modulation;
  check(powerLevel: number):Diagnose;
}

// based on https://www.vodafonekabelforum.de/viewtopic.php?t=32353
export default class DocsisDiagnose{
  constructor(private docsisStatus:DocsisStatus) {
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

  detectDeviations(): boolean{
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
}

export function diagnoseDownstream(status: HumanizedDocsisChannelStatus): any{
  return 
}


export class UpstreamDeviationSCQAM implements Deviation{
  modulation = "64QAM" as const
  channelType = "SC-QAM" as const
  
  check(powerLevel: number): Diagnose {
    if (powerLevel <= 35)
      return SofortigeBeseitigung
    if (35 < powerLevel && powerLevel <= 37)
      return BeseitigungBinnenMonatsfrist;
    if (37 < powerLevel && powerLevel <= 41)
      return TolerierteAbweichung;
    if (41 < powerLevel && powerLevel <= 47)
      return Vorgabekonform;
    if (47 < powerLevel && powerLevel <= 51)
      return TolerierteAbweichung;
    if (51 < powerLevel && powerLevel <= 53)
      return BeseitigungBinnenMonatsfrist;
    if ( 53 < powerLevel)
      return SofortigeBeseitigung
    
    throw new Error(`PowerLevel is not within supported range. PowerLevel: ${powerLevel}`);
  }
}


export class UpstreamDeviationOFDMA implements Deviation{
  modulation = "64QAM" as const
  channelType = "OFDMA" as const

  check(powerLevel: number): Diagnose {
    if (powerLevel <= 38)
      return SofortigeBeseitigung
    if (38 < powerLevel && powerLevel <= 40)
      return BeseitigungBinnenMonatsfrist;
    if (40 < powerLevel && powerLevel <= 44)
      return TolerierteAbweichung;
    if (44 < powerLevel && powerLevel <= 47)
      return Vorgabekonform;
    if (47 < powerLevel && powerLevel <= 48)
      return TolerierteAbweichung;
    if (48 < powerLevel && powerLevel <= 50)
      return BeseitigungBinnenMonatsfrist;
    if ( 50 < powerLevel)
      return SofortigeBeseitigung
    
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
      return SofortigeBeseitigung
    if (-14 < powerLevel && powerLevel <= -12)
      return BeseitigungBinnenMonatsfrist;
    if (-12 < powerLevel && powerLevel <= -10)
      return TolerierteAbweichung;
    if (-10 < powerLevel && powerLevel <= 7)
      return Vorgabekonform;
    if (7 < powerLevel && powerLevel <= 12)
      return TolerierteAbweichung;
    if (12 < powerLevel && powerLevel <= 14)
      return BeseitigungBinnenMonatsfrist;
    if ( 14.1 <= powerLevel)
      return SofortigeBeseitigung
    
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


export const SofortigeBeseitigung: Diagnose = {
  description : "SofortigeBeseitigung",
  deviation: true,
  color:"red",
}
export const Vorgabekonform: Diagnose ={
  description :"Vorgabekonform",
  deviation: false,
  color:"green"
}
export const TolerierteAbweichung: Diagnose = {
  description :"Tolerierte Abweichung",
  deviation: false,
  color:"green"
}
export const BeseitigungBinnenMonatsfrist: Diagnose = {
  description :"Beseitigung binnen Monatsfrist",
  deviation: true,
  color:"yellow"
}

export function downstreamDeviationFactory(modulation: Modulation): Deviation {
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
    return SofortigeBeseitigung
  if (24 < adjustedSNR && adjustedSNR <= 26)
    return BeseitigungBinnenMonatsfrist;
  if (26 < adjustedSNR && adjustedSNR <= 27)
    return TolerierteAbweichung;
  if (27 < adjustedSNR)
    return Vorgabekonform;
    
  throw new Error(`SignalToNoiseRation is not within supported range. SNR: ${snr}`);
}