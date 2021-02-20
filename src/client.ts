import axios from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import {
  CryptoVars,
  DocsisStatus,
  extractCredentialString,
  extractCryptoVars,
  extractDocsisStatus,
} from "./htmlParser";
import { decrypt, deriveKey, encrypt } from "./crypto";

const USERNAME = "admin";
const URL = "192.168.100.1";

// axios cookie support
axiosCookieJarSupport(axios);
axios.defaults.withCredentials = true;
const cookieJar = new CookieJar();
axios.defaults.jar = cookieJar;
axios.defaults.baseURL = `http://${URL}`;

export async function fetchCredential(): Promise<string> {
  try {
    const { data } = await axios.get("/base_95x.js");
    return extractCredentialString(data);
  } catch (error) {
    console.error("Could not fetch credential.", error);
    throw error;
  }
}

export interface SetPasswordRequest {
  AuthData: string;
  EncryptData: string;
  Name: string;
}

export function encryptPassword(
  password: string,
  cryptoVars: CryptoVars
): SetPasswordRequest {
  const jsData =
    '{"Password": "' + password + '", "Nonce": "' + cryptoVars.sessionId + '"}';
  const key = deriveKey(password, cryptoVars.salt);
  const authData = "loginPassword";
  const encryptData = encrypt(key, jsData, cryptoVars.iv, authData);

  return {
    EncryptData: encryptData,
    Name: USERNAME,
    AuthData: authData,
  };
}

export async function getCurrentCryptoVars(): Promise<CryptoVars> {
  try {
    const { data } = await axios.get("/", {
      headers: { Accept: "text/html,application/xhtml+xml,application/xml" },
    });
    const cryptoVars = extractCryptoVars(data);
    console.debug("Parsed crypto vars: ", cryptoVars);
    return cryptoVars;
  } catch (error) {
    console.error("Could not get the index page from the router", error);
    throw error;
  }
}

interface SetPasswordResponse {
  p_status: string;
  encryptData: string;
  p_waitTime?: number;
}

export async function createServerRecord(
  setPasswordRequest: SetPasswordRequest
): Promise<SetPasswordResponse> {
  try {
    const { data } = await axios.post<SetPasswordResponse>(
      "/php/ajaxSet_Password.php",
      setPasswordRequest
    );
    //TODO handle wrong password case
    //{ p_status: 'Lockout', p_waitTime: 1 }
    return data;
  } catch (error) {
    console.error("Could not set password on remote router.", error);
    throw error;
  }
}

export function loginPasswordCheck(
  encryptedData: string,
  cryptoVars: CryptoVars,
  key: string
): string {
  const csrf_nonce = decrypt(key, encryptedData, cryptoVars.iv, "nonce");
  return csrf_nonce;
}

export async function fetchDocsisStatus(
  csrfNonce: string
): Promise<DocsisStatus> {
  try {
    const { data } = await axios.get("/php/status_docsis_data.php", {
      headers: {
        csrfNonce,
        Referer: `http://${URL}/?status_docsis&mid=StatusDocsis`,
        "X-Requested-With": "XMLHttpRequest",
        Connection: "keep-alive",
      },
    });
    return extractDocsisStatus(data);
  } catch (error) {
    console.error("Could not fetch remote docsis status", error);
    throw error;
  }
}

export async function logout(): Promise<boolean> {
  try {
    console.info("Logging out...");
    await axios.post(`/php/logout.php`);
    return true;
  } catch (error) {
    console.error("Could not do a full session logout", error);
    throw error;
  }
}

export async function addCredentialToCookie() {
  const credential = await fetchCredential();
  console.debug("Credential: ", credential);
  // set obligatory static cookie
  cookieJar.setCookie(`credential= ${credential}`, `http://${URL}`);
}

export async function login(password: string) {
  const cryptoVars = await getCurrentCryptoVars();
  const encPw = encryptPassword(password, cryptoVars);
  console.debug("Encrypted password: ", encPw);
  const serverSetPassword = await createServerRecord(encPw);
  console.debug("ServerSetPassword: ", serverSetPassword);

  const csrfNonce = loginPasswordCheck(
    serverSetPassword.encryptData,
    cryptoVars,
    deriveKey(password, cryptoVars.salt)
  );
  console.debug("Csrf nonce: ", csrfNonce);

  await addCredentialToCookie();
  return csrfNonce;
}
