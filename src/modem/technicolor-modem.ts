import {deriveKeyTechnicolor} from '../crypto'
import {Log} from '../logger'
import {DocsisStatus, Modem} from '../modem'

export interface TechnicolorConfiguration{
    error: string | 'ok';
    message: string;
    data: {
        LanMode: 'router' | 'modem';
        DeviceMode: 'Ipv4' | 'Ipv4';
        firmwareversion: string;
        internetipv4: string;
        AFTR: string;
        IPAddressRT: string[];
    };
}

export interface TechnicolorSaltResponse{
    error: string | 'ok';
    salt: string;
    saltwebui: string;
    message?: string;
}

export interface TechnicolorLoginResponse{
    error: 'error';
    message: string;
    data: any[];
}

export class Technicolor extends Modem {
  constructor(readonly modemIp: string, readonly logger: Log) {
    super(modemIp, logger)
  }

  async login(password: string): Promise<void> {
    try {
      const {data: salt} = await this.httpClient.post<TechnicolorSaltResponse>('/api/v1/session/login', `username=${Modem.USERNAME}&password=seeksalthash`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
      })
      this.logger.debug('Salt', salt)

      if (salt.message && salt.message === 'MSG_LOGIN_150') {
        throw new Error('A user is already logged in')
      }

      const derivedKey = deriveKeyTechnicolor(deriveKeyTechnicolor(password, salt.salt), salt.saltwebui)
      const {data: loginResponse} = await this.httpClient.post<TechnicolorLoginResponse>('/api/v1/session/login', `username=${Modem.USERNAME}&password=${derivedKey}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      })
      this.logger.log('fam status', loginResponse)
    } catch (error) {
      this.logger.warn(`Something went wrong with the login ${error}`)
    } finally {
      await this.logout()
    }
  }

  async docsis(): Promise<DocsisStatus> {
    const {data: docsisStatus} = await this.httpClient.get('/api/v1/sta_docsis_status')
    return docsisStatus
  }

  async logout(): Promise<void> {
    this.logger.debug('Logging out...')
    return this.httpClient.post('api/v1/session/logout')
  }
}
