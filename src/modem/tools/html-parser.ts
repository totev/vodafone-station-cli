import type {ArrisDocsisChannelStatus, ArrisDocsisStatus} from '../arris-modem'

const nonceMatcher = /var csp_nonce = "(?<nonce>.*?)";/gm
const ivMatcher = /var myIv = ["|'](?<iv>.*?)["|'];/gm
const saltMatcher = /var mySalt = ["|'](?<salt>.*?)["|'];/gm
const sessionIdMatcher = /var currentSessionId = ["|'](?<sessionId>.*?)["|'];/gm
const swVersionMatcher = /_ga.swVersion = ["|'](?<swVersion>.*?)["|'];/gm

export interface CryptoVars {
  iv: string;
  nonce: string;
  salt: string;
  sessionId: string;
}

export function extractCryptoVars(html: string): CryptoVars {
  const nonce = nonceMatcher.exec(html)?.groups?.nonce
  const iv = ivMatcher.exec(html)?.groups?.iv
  const salt = saltMatcher.exec(html)?.groups?.salt
  const sessionId = sessionIdMatcher.exec(html)?.groups?.sessionId
  return {
    iv, nonce, salt, sessionId,
  } as CryptoVars
}

export function extractFirmwareVersion(html: string): string | undefined {
  return swVersionMatcher.exec(html)?.groups?.swVersion
}

export function extractDocsisStatus(
  html: string,
  date: Date = new Date(),
): ArrisDocsisStatus {
  const docsisMatcher = {
    dsChannels: /js_dsNums = ["|'](?<dsChannels>.*?)["|'];/gm,
    dsData: /json_dsData = (?<dsData>.*?);/gm,
    ofdmChannels: /js_ofdmNums = ["|'](?<ofdmChannels>.*?)["|'];/gm,
    usChannels: /js_usNums = ["|'](?<usChannels>.*?)["|'];/gm,
    usData: /json_usData = (?<usData>.*?);/gm,
  }

  const downstream = docsisMatcher.dsData.exec(html)?.groups?.dsData ?? '[]'
  const upstream = docsisMatcher.usData.exec(html)?.groups?.usData ?? '[]'
  const downstreamChannels
    = docsisMatcher.dsChannels.exec(html)?.groups?.dsChannels ?? '0'
  const upstreamChannels
    = docsisMatcher.usChannels.exec(html)?.groups?.usChannels ?? '0'
  const ofdmChannels
    = docsisMatcher.ofdmChannels.exec(html)?.groups?.ofdmChannels ?? '0'
  return {
    downstream: JSON.parse(downstream) as ArrisDocsisChannelStatus[],
    downstreamChannels: Number.parseInt(downstreamChannels, 10),
    ofdmChannels: Number.parseInt(ofdmChannels, 10),
    time: date.toISOString(),
    upstream: JSON.parse(upstream) as ArrisDocsisChannelStatus[],
    upstreamChannels: Number.parseInt(upstreamChannels, 10),
  }
}

export function extractCredentialString(html: string): string {
  const matcher = /createCookie\([\n]*\s*"credential"\s*,[\n]*\s*["|'](?<credential>.*?)["|']\s*/gims
  return matcher.exec(html)?.groups?.credential ?? ''
}
