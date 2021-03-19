import {CliClient} from './client'
import {CryptoVars} from './html-parser'
import {ConsoleLogger} from './logger'

describe('client', () => {
  test('should encrypt', () => {
    const expected = {
      EncryptData:
        '8059e124da83bf88c89ae02ab0c7a0335a272a2045e5c3fb075dcfba42788b5436483e01f37b5f25c50b5d9e6366734eb9eb33919d892e97bb025c63e35b5a76e5ffe53a292e8e8ebc99c923ea2977803b',
      Name: 'admin',
      AuthData: 'loginPassword',
    }
    const given: CryptoVars = {
      iv: 'c68af53914949158',
      salt: 'c4d0a0c70c3fcac4',
      sessionId: '01a91cedd129fd8c6f18e3a1b58d096f',
      nonce: 'WslSZgE7NuQr+1BMqiYEOBMzQlo=',
    }
    const cliClient = new CliClient('0.0.0.0', new ConsoleLogger())
    expect(cliClient.encryptPassword('test', given)).toEqual(expected)
  })
})
