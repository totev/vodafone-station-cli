import * as fs from 'fs'
import * as path from 'path'
import {
  extractCredentialString,
  extractCryptoVars,
  extractDocsisStatus,
  extractFirmwareVersion,
} from './html-parser'

describe('htmlParser', () => {
  const fixtureIndex = fs.readFileSync(
    path.join(__dirname, './__fixtures__/index.php.html'),
    'utf8'
  )
  test('extractCryptoVars', () => {
    const expected = {
      nonce: 'cyCCZrSU0MXlXGhDso44BGA+MmA=',
      iv: 'da571578b4f51e21',
      salt: '02355f4a986c6900',
      sessionId: '343fe70eb4a25c54c34ce1c43d8359f4',
    }
    const extractedVars = extractCryptoVars(fixtureIndex)
    expect(extractedVars).toBeTruthy()
    expect(extractedVars).toEqual(expected)
  })

  test('extractDocsisStatus', () => {
    const fixtureDocsisData = fs.readFileSync(
      path.join(__dirname, './__fixtures__/status_docsis_data.php.html'),
      'utf8'
    )
    expect(
      extractDocsisStatus(
        fixtureDocsisData,
        new Date('2021-02-26T09:19:56.042Z')
      )
    ).toMatchSnapshot()
  })
  test('extractCredentialString', () => {
    const fixture = fs.readFileSync(
      path.join(__dirname, './__fixtures__/base_95x.js'),
      'utf8'
    )
    expect(extractCredentialString(fixture)).toEqual(
      'someRandomCatchyHash37f1f79255b66b5c02348e3dc6ff5fcd559654e2'
    )
  })

  test('extractFirmwareVersion', () => {
    expect(extractFirmwareVersion(fixtureIndex)).toBe('01.02.068.11.EURO.PC20')
  })
})
