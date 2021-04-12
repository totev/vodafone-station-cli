import {DocsisChannelStatus, DocsisStatus} from './modem'

const nonceMatcher = /var csp_nonce = "(?<nonce>.*?)";/gm
const ivMatcher = /var myIv = ["|'](?<iv>.*?)["|'];/gm
const saltMatcher = /var mySalt = ["|'](?<salt>.*?)["|'];/gm
const sessionIdMatcher = /var currentSessionId = ["|'](?<sessionId>.*?)["|'];/gm
const swVersionMatcher = /_ga.swVersion = ["|'](?<swVersion>.*?)["|'];/gm

export interface CryptoVars {
  nonce: string;
  iv: string;
  salt: string;
  sessionId: string;
}

export function extractCryptoVars(html: string): CryptoVars {
  const nonce = nonceMatcher.exec(html)?.groups?.nonce
  const iv = ivMatcher.exec(html)?.groups?.iv
  const salt = saltMatcher.exec(html)?.groups?.salt
  const sessionId = sessionIdMatcher.exec(html)?.groups?.sessionId
  return {nonce, iv, salt, sessionId} as CryptoVars
}

export function extractFirmwareVersion(html: string): string|undefined {
  return swVersionMatcher.exec(html)?.groups?.swVersion
}

export function extractDocsisStatus(
  html: string,
  date: Date = new Date()
): DocsisStatus {
  const docsisMatcher = {
    dsData: /json_dsData = (?<dsData>.*?);/gm,
    usData: /json_usData = (?<usData>.*?);/gm,
    dsChannels: /js_dsNums = ["|'](?<dsChannels>.*?)["|'];/gm,
    usChannels: /js_usNums = ["|'](?<usChannels>.*?)["|'];/gm,
    ofdmChannels: /js_ofdmNums = ["|'](?<ofdmChannels>.*?)["|'];/gm,
  }

  const downstream = docsisMatcher.dsData.exec(html)?.groups?.dsData ?? '[]'
  const upstream = docsisMatcher.usData.exec(html)?.groups?.usData ?? '[]'
  const downstreamChannels =
    docsisMatcher.dsChannels.exec(html)?.groups?.dsChannels ?? '0'
  const upstreamChannels =
    docsisMatcher.usChannels.exec(html)?.groups?.usChannels ?? '0'
  const ofdmChannels =
    docsisMatcher.ofdmChannels.exec(html)?.groups?.ofdmChannels ?? '0'
  return {
    downstream: JSON.parse(downstream) as DocsisChannelStatus[],
    upstream: JSON.parse(upstream) as DocsisChannelStatus[],
    downstreamChannels: Number.parseInt(downstreamChannels, 10),
    upstreamChannels: Number.parseInt(upstreamChannels, 10),
    ofdmChannels: Number.parseInt(ofdmChannels, 10),
    time: date.toISOString(),
  }
}

export function extractCredentialString(html: string): string {
  const matcher = /createCookie\([\n]*\s*"credential"\s*,[\n]*\s*["|'](?<credential>.*?)["|']\s*/gims
  return matcher.exec(html)?.groups?.credential ?? ''
}
