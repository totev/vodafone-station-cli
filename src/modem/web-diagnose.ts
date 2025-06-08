import {brotliCompressSync} from 'node:zlib';

import type {DocsisStatus} from './modem';

export function compressDocsisStatus(docsisStatus: DocsisStatus): string {
  const json  = JSON.stringify(docsisStatus)
  const compressed = brotliCompressSync(Buffer.from(json, 'utf-8'))
  return compressed.toString('base64url')
}

export function webDiagnoseLink(docsisStatus: DocsisStatus): string {
  return `https://docsis-diagnose.totev.dev/#docsis=${compressDocsisStatus(docsisStatus)}`
}
