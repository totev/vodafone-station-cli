/* eslint-disable new-cap */
import sjcl from 'sjcl'
const SJCL_ITERATIONS = 1000
const SJCL_KEYSIZEBITS = 128
const SJCL_TAGLENGTH = 128

export function prepareParameters(
  derivedKey: string,
  ivHex: string,
  authData: string
) {
  return {
    prf: new sjcl.cipher.aes(sjcl.codec.hex.toBits(derivedKey)),
    iv: sjcl.codec.hex.toBits(ivHex),
    authData: sjcl.codec.utf8String.toBits(authData),
  }
}

export function deriveKey(password: string, salt: string): string {
  const derivedKeyBits = sjcl.misc.pbkdf2(
    password,
    sjcl.codec.hex.toBits(salt),
    SJCL_ITERATIONS,
    SJCL_KEYSIZEBITS
  )

  return sjcl.codec.hex.fromBits(derivedKeyBits)
}

export function deriveKeyTechnicolor(password: string, salt: string): string {
  const derivedKeyBits = sjcl.misc.pbkdf2(password, salt,     SJCL_ITERATIONS,
    SJCL_KEYSIZEBITS)
  return sjcl.codec.hex.fromBits(derivedKeyBits)
}

export function encrypt(
  derivedKey: string,
  plainText: string,
  ivHex: string,
  authData: string
): string {
  const bitParams = prepareParameters(derivedKey, ivHex, authData)
  const encryptedBits = sjcl.mode.ccm.encrypt(
    bitParams.prf,
    sjcl.codec.utf8String.toBits(plainText),
    bitParams.iv,
    bitParams.authData,
    SJCL_TAGLENGTH
  )
  return sjcl.codec.hex.fromBits(encryptedBits)
}

export function decrypt(
  derivedKey: string,
  cipherTextHex: string,
  ivHex: string,
  authData: string
): string {
  const bitParams = prepareParameters(derivedKey, ivHex, authData)
  const decryptedBits = sjcl.mode.ccm.decrypt(
    bitParams.prf,
    sjcl.codec.hex.toBits(cipherTextHex),
    bitParams.iv,
    bitParams.authData,
    SJCL_TAGLENGTH
  )
  return sjcl.codec.utf8String.fromBits(decryptedBits)
}

