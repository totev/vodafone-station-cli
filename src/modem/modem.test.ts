import { brotliDecompressSync } from "zlib"
import { compressDocsisStatus, DocsisStatus } from "./modem"
import fixtureDocsisStatus from './__fixtures__/docsisStatus_normalized.json'

test('should compress json status with brotli', () => {
  const status = compressDocsisStatus(fixtureDocsisStatus as DocsisStatus)
  console.log(status)
  const decompressed = brotliDecompressSync((Buffer.from(status, "base64url")))
  const decompressedStatus = JSON.parse(decompressed.toString("utf-8"))
  
  expect(decompressedStatus).toStrictEqual(fixtureDocsisStatus)
})