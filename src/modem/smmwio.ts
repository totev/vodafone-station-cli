import type { DocsisStatus } from "./modem";
import { brotliCompressSync } from "zlib";

export function compressDocsisStatus(docsisStatus: DocsisStatus): string{
  const json  = JSON.stringify(docsisStatus)
  const compressed = brotliCompressSync(Buffer.from(json, 'utf-8'))
  return compressed.toString('base64url')
}

export function webDiagnoseLink(docsisStatus: DocsisStatus): string{
  return `https://smmwio.endofco.de/#docsis=${compressDocsisStatus(docsisStatus)}`
}