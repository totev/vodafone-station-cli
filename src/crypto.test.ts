import {decrypt, deriveKey, deriveKeyTechnicolor, encrypt} from './crypto'
import {CryptoVars} from './html-parser'

describe('crypto', () => {
  const cryptoVars: CryptoVars = {
    iv: 'c68af53914949158',
    salt: 'c4d0a0c70c3fcac4',
    sessionId: '01a91cedd129fd8c6f18e3a1b58d096f',
    nonce: 'WslSZgE7NuQr+1BMqiYEOBMzQlo=',
  }
  const testPasswordAsKey = '203c8c0da0606debbdd581d1a1cdb2c8'

  test('deriveKey', () => {
    expect(deriveKey('test', cryptoVars.salt)).toEqual(testPasswordAsKey)
  })

  test('deriveKey from technicolor', () => {
    const password = 'as'
    const salt = 'HSts76GJOAB'
    const expected = 'bcdf6051836bf84744229389ccc96896'
    expect(deriveKeyTechnicolor(password, salt)).toBe(expected)
  })
  test('encrypt', () => {
    expect(
      encrypt(testPasswordAsKey, 'textToEncrypt', cryptoVars.iv, 'authData')
    ).toEqual('8f1ec931fd9f8d89d98cbb60e4a021320e988b9c6ab97b97208639aa72')
  })

  test('decrypt', () => {
    expect(
      decrypt(
        testPasswordAsKey,
        '8f1ec931fd9f8d89d98cbb60e4a021320e988b9c6ab97b97208639aa72',
        cryptoVars.iv,
        'authData'
      )
    ).toEqual('textToEncrypt')
  })
})
