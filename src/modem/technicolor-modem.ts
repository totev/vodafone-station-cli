import { Log } from '../logger';
import {
    DocsisChannelType, DocsisStatus, HumanizedDocsis31ChannelStatus, HumanizedDocsisChannelStatus, Modem, normalizeModulation,
} from './modem';
import { deriveKeyTechnicolor } from './tools/crypto';

export interface TechnicolorBaseResponse {
  data?: {[key: string]: unknown};
  error: 'error' | 'ok' | string;
  message: string;
}

export interface TechnicolorConfiguration extends TechnicolorBaseResponse {
  data: {
    AFTR: string;
    DeviceMode: 'Ipv4' | 'Ipv4';
    firmwareversion: string;
    internetipv4: string;
    IPAddressRT: string[];
    LanMode: 'modem' | 'router';
  };
}

export interface TechnicolorSaltResponse  extends TechnicolorBaseResponse {
  salt: string;
  saltwebui: string;
}

export interface TechnicolorTokenResponse  extends TechnicolorBaseResponse {
  token: string;
}

export interface TechnicolorDocsisStatus {
  data: {
    downstream: TechnicolorDocsisChannelStatus[];
    ofdm_downstream: TechnicolorDocsis31ChannelStatus[];
    ofdma_upstream: TechnicolorDocsis31UpstreamChannelStatus[];
    upstream: TechnicolorDocsisUpstreamChannelStatus[];
  };
  error: string;
  message: string;
}

export interface TechnicolorDocsisUpstreamChannelStatus extends Omit<TechnicolorDocsisChannelStatus, 'channelid' | 'locked' | 'SNR'> {
  CentralFrequency: string;
  channelidup: string;
  RangingStatus: string;
}

export interface TechnicolorDocsis31UpstreamChannelStatus {
  __id: string; // '1',
  bandwidth: string; // '35 MHz',
  CentralFrequency: string; // '46 MHz',
  channelidup: string; // '9',
  ChannelType: string; // 'OFDMA',
  end_frequency: string; // '64.750000 MHz',
  FFT: string; // 'qpsk',
  power: string; // '44.0 dBmV',
  RangingStatus: string;// 'Completed'
  start_frequency: string; // '29.800000 MHz',
}

export interface TechnicolorDocsisChannelStatus {
  __id: string;
  CentralFrequency: string; // MHz
  channelid: string;
  ChannelType: DocsisChannelType;
  FFT: string; // modulation
  locked: string;
  power: string; // dBmV
  SNR: string; // dB
}

export interface TechnicolorDocsis31ChannelStatus {
  __id: string;
  bandwidth: string; // MHz
  CentralFrequency_ofdm: string; // MHz
  channelid_ofdm: string;
  ChannelType: DocsisChannelType;
  end_frequency: string; // MHz
  FFT_ofdm: string; // 'qam256/qam1024'
  locked_ofdm: string;
  power_ofdm: string; // dBmV
  SNR_ofdm: string; // dB
  start_frequency: string; // MHz
}

export function normalizeChannelStatus(channelStatus: TechnicolorDocsisChannelStatus): HumanizedDocsisChannelStatus {
  return {
    channelId: channelStatus.channelid,
    channelType: channelStatus.ChannelType,
    frequency: Number.parseInt(`${channelStatus.CentralFrequency ?? 0}`, 10),
    lockStatus: channelStatus.locked,
    modulation: normalizeModulation(channelStatus.FFT),
    powerLevel: Number.parseFloat(channelStatus.power),
    snr: Number.parseFloat(`${channelStatus.SNR ?? 0}`),
  }
}

export function normalizeUpstreamChannelStatus(channelStatus: TechnicolorDocsisUpstreamChannelStatus): HumanizedDocsisChannelStatus {
  return {
    channelId: channelStatus.channelidup,
    channelType: channelStatus.ChannelType,
    frequency: Number.parseInt(`${channelStatus.CentralFrequency ?? 0}`, 10),
    lockStatus: channelStatus.RangingStatus,
    modulation: normalizeModulation(channelStatus.FFT),
    powerLevel: Number.parseFloat(channelStatus.power),
    snr: 0,
  }
}

export function normalizeUpstreamOfdmaChannelStatus(channelStatus: TechnicolorDocsis31UpstreamChannelStatus): HumanizedDocsis31ChannelStatus {
  return {
    channelId: channelStatus.channelidup,
    channelType: channelStatus.ChannelType as DocsisChannelType,
    frequencyEnd: Number.parseFloat(channelStatus.end_frequency),
    frequencyStart: Number.parseFloat(channelStatus.start_frequency),
    lockStatus: channelStatus.RangingStatus,
    modulation: normalizeModulation(channelStatus.FFT),
    powerLevel: Number.parseFloat(channelStatus.power),
    snr: 0,
  }
}

export function normalizeOfdmChannelStatus(channelStatus: TechnicolorDocsis31ChannelStatus): HumanizedDocsis31ChannelStatus {
  return {
    channelId: channelStatus.channelid_ofdm,
    channelType: channelStatus.ChannelType,
    frequencyEnd: Number.parseInt(channelStatus.end_frequency, 10),
    frequencyStart: Number.parseInt(channelStatus.start_frequency, 10),
    lockStatus: channelStatus.locked_ofdm,
    modulation: normalizeModulation(channelStatus.FFT_ofdm),
    powerLevel: Number.parseFloat(channelStatus.power_ofdm),
    snr: Number.parseFloat(channelStatus.SNR_ofdm),
  }
}

export function normalizeDocsisStatus(channelStatus: TechnicolorDocsisStatus): DocsisStatus {
  return {
    downstream: channelStatus.data.downstream.map(channel => normalizeChannelStatus(channel)),
    downstreamOfdm: channelStatus.data.ofdm_downstream.map(channel => normalizeOfdmChannelStatus(channel)),
    time: new Date().toISOString(),
    upstream: channelStatus.data.upstream.map(channel => normalizeUpstreamChannelStatus(channel)),
    upstreamOfdma: channelStatus.data.ofdma_upstream.map(channel => normalizeUpstreamOfdmaChannelStatus(channel)),
  }
}

export class Technicolor extends Modem {
  constructor(readonly modemIp: string, readonly logger: Log) {
    super(modemIp, logger)
  }

  async docsis(): Promise<DocsisStatus> {
    const {data: docsisStatus} = await this.httpClient.get('/api/v1/sta_docsis_status', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Referer: `http://${this.modemIp}`,
      },
    })
    return normalizeDocsisStatus(docsisStatus as TechnicolorDocsisStatus)
  }

  async login(password: string): Promise<void> {
    try {
      const {data: salt} = await this.httpClient.post<TechnicolorSaltResponse>('/api/v1/session/login', `username=${Modem.USERNAME}&password=seeksalthash`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Referer: `http://${this.modemIp}`,
        },
      })
      this.logger.debug('Salt', salt)

      if (salt.message && salt.message === 'MSG_LOGIN_150') {
        throw new Error('A user is already logged in. Log out from the other session first.')
      }

      const derivedKey = deriveKeyTechnicolor(deriveKeyTechnicolor(password, salt.salt), salt.saltwebui)
      this.logger.debug('Derived key', derivedKey)
      const {data: loginResponse} = await this.httpClient.post<TechnicolorBaseResponse>('/api/v1/session/login', `username=${Modem.USERNAME}&password=${derivedKey}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Referer: `http://${this.modemIp}`,
        },
      })
      this.logger.debug('Login status', loginResponse)

      if (loginResponse.error === 'error' && loginResponse.message === 'MSG_LOGIN_150') {
        throw new Error('A user is already logged in. Log out from the other session first.')
      }

      const {data: messageResponse} = await this.httpClient.get<TechnicolorBaseResponse>('/api/v1/session/menu', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Referer: `http://${this.modemIp}`,
        },
      })
      this.logger.debug('Message status', messageResponse)
    } catch (error) {
      this.logger.debug(`Something went wrong with the login ${error}`)
      throw error
    }
  }

  async logout(): Promise<void> {
    this.logger.debug('Logging out...')
    return this.httpClient.post('api/v1/session/logout')
  }

  async restart(): Promise<unknown> {
    const {data: tokenResponse} = await this.httpClient.get<TechnicolorTokenResponse>('api/v1/session/init_page', {
      headers: {
        Referer: `http://${this.modemIp}`,
      },
    })

    this.logger.debug('Token response: ', tokenResponse)
    const {data: restartResponse} = await this.httpClient.post<TechnicolorBaseResponse>(
      'api/v1/sta_restart',
      'restart=Router%2CWifi%2CVoIP%2CDect%2CMoCA&ui_access=reboot_device',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Referer: `http://${this.modemIp}`,
          'X-CSRF-TOKEN': tokenResponse.token,
        },
      },
    )

    if (restartResponse?.error === 'error') {
      this.logger.debug(restartResponse)
      throw new Error(`Could not restart router: ${restartResponse.message}`)
    }

    return restartResponse
  }
}

