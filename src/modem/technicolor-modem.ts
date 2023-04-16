import { Log } from '../logger'
import { Protocol } from "./discovery";
import { DocsisChannelType, DocsisStatus, HumanizedDocsis31ChannelStatus, HumanizedDocsisChannelStatus, Modem, normalizeModulation } from './modem'
import { deriveKeyTechnicolor } from './tools/crypto'

export interface TechnicolorBaseResponse{
  error: string | 'ok' | 'error';
  message: string;
  data?: {[key: string]: unknown};
}

export interface TechnicolorConfiguration extends TechnicolorBaseResponse{
    data: {
        LanMode: 'router' | 'modem';
        DeviceMode: 'Ipv4' | 'Ipv4';
        firmwareversion: string;
        internetipv4: string;
        AFTR: string;
        IPAddressRT: string[];
    };
}

export interface TechnicolorSaltResponse  extends TechnicolorBaseResponse{
    salt: string;
    saltwebui: string;
}

export interface TechnicolorTokenResponse  extends TechnicolorBaseResponse{
    token: string;
}

export interface TechnicolorDocsisStatus {
  error: string;
  message: string;
  data: {
    downstream: TechnicolorDocsisChannelStatus[];
    ofdm_downstream: TechnicolorDocsis31ChannelStatus[];
    upstream: TechnicolorDocsisUpstreamChannelStatus[];
    ofdma_upstream: TechnicolorDocsis31UpstreamChannelStatus[];
  };
}

export interface TechnicolorDocsisUpstreamChannelStatus extends Omit<TechnicolorDocsisChannelStatus, 'channelid'|'locked'|'SNR'>{
        channelidup: string;
        CentralFrequency: string;
        RangingStatus: string;
}

export interface TechnicolorDocsis31UpstreamChannelStatus{
    __id: string; // '1',
    channelidup: string; // '9',
    start_frequency: string; // '29.800000 MHz',
    end_frequency: string; // '64.750000 MHz',
    power: string; // '44.0 dBmV',
    CentralFrequency: string; // '46 MHz',
    bandwidth: string; // '35 MHz',
    FFT: string; // 'qpsk',
    ChannelType: string; // 'OFDMA',
    RangingStatus: string;// 'Completed'
}

export interface TechnicolorDocsisChannelStatus {
  __id: string;
  channelid: string;
  CentralFrequency: string; // MHz
  power: string; // dBmV
  SNR: string; // dB
  FFT: string; // modulation
  locked: string;
  ChannelType: DocsisChannelType;
}

export interface TechnicolorDocsis31ChannelStatus {
    __id: string;
    channelid_ofdm: string;
    start_frequency: string; // MHz
    end_frequency: string; // MHz
    CentralFrequency_ofdm: string; // MHz
    bandwidth: string; // MHz
    power_ofdm: string; // dBmV
    SNR_ofdm: string; // dB
    FFT_ofdm:  string; // 'qam256/qam1024'
    locked_ofdm: string;
    ChannelType: DocsisChannelType;
}

export function normalizeChannelStatus(channelStatus: TechnicolorDocsisChannelStatus): HumanizedDocsisChannelStatus {
  return {
    channelId: channelStatus.channelid,
    channelType: channelStatus.ChannelType,
    modulation: normalizeModulation(channelStatus.FFT),
    lockStatus: channelStatus.locked,
    snr: parseFloat(`${channelStatus.SNR ?? 0}`),
    frequency: parseInt(`${channelStatus.CentralFrequency ?? 0}`, 10),
    powerLevel: parseFloat(channelStatus.power),
  }
}
export function normalizeUpstreamChannelStatus(channelStatus: TechnicolorDocsisUpstreamChannelStatus): HumanizedDocsisChannelStatus {
  return {
    channelId: channelStatus.channelidup,
    channelType: channelStatus.ChannelType,
    modulation: normalizeModulation(channelStatus.FFT),
    lockStatus: channelStatus.RangingStatus,
    snr: 0,
    frequency: parseInt(`${channelStatus.CentralFrequency ?? 0}`, 10),
    powerLevel: parseFloat(channelStatus.power),
  }
}
export function normalizeUpstreamOfdmaChannelStatus(channelStatus: TechnicolorDocsis31UpstreamChannelStatus): HumanizedDocsis31ChannelStatus {
  return {
    channelId: channelStatus.channelidup,
    lockStatus: channelStatus.RangingStatus,
    channelType: channelStatus.ChannelType as DocsisChannelType,
    modulation: normalizeModulation(channelStatus.FFT),
    powerLevel: parseFloat(channelStatus.power),
    frequencyStart: parseFloat(channelStatus.start_frequency),
    frequencyEnd: parseFloat(channelStatus.end_frequency),
    snr: 0
  }
}

export function normalizeOfdmChannelStatus(channelStatus: TechnicolorDocsis31ChannelStatus): HumanizedDocsis31ChannelStatus {
  return {
    channelId: channelStatus.channelid_ofdm,
    lockStatus: channelStatus.locked_ofdm,
    channelType: channelStatus.ChannelType,
    modulation: normalizeModulation(channelStatus.FFT_ofdm),
    powerLevel: parseFloat(channelStatus.power_ofdm),
    frequencyStart: parseInt(channelStatus.start_frequency, 10),
    frequencyEnd: parseInt(channelStatus.end_frequency, 10),
    snr: parseFloat(channelStatus.SNR_ofdm)
  }
}

export function normalizeDocsisStatus(channelStatus: TechnicolorDocsisStatus): DocsisStatus {
  return {
    downstream: channelStatus.data.downstream.map(normalizeChannelStatus),
    downstreamOfdm: channelStatus.data.ofdm_downstream.map(normalizeOfdmChannelStatus),
    upstream: channelStatus.data.upstream.map(normalizeUpstreamChannelStatus),
    upstreamOfdma: channelStatus.data.ofdma_upstream.map(normalizeUpstreamOfdmaChannelStatus),
    time: new Date().toISOString()
  }
}

export class Technicolor extends Modem {
  constructor(
    readonly modemIp: string,
    readonly protocol: Protocol,
    readonly logger: Log
  ) {
    super(modemIp, protocol, logger);
  }

  async login(password: string): Promise<void> {
    try {
      const { data: salt } =
        await this.httpClient.post<TechnicolorSaltResponse>(
          "/api/v1/session/login",
          `username=${Modem.USERNAME}&password=seeksalthash`,
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              Referer: this.baseUrl,
            },
          }
        );
      this.logger.debug("Salt", salt);

      if (salt.message && salt.message === "MSG_LOGIN_150") {
        throw new Error("A user is already logged in");
      }

      const derivedKey = deriveKeyTechnicolor(
        deriveKeyTechnicolor(password, salt.salt),
        salt.saltwebui
      );
      this.logger.debug("Derived key", derivedKey);
      const { data: loginResponse } =
        await this.httpClient.post<TechnicolorBaseResponse>(
          "/api/v1/session/login",
          `username=${Modem.USERNAME}&password=${derivedKey}`,
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              Referer: this.baseUrl,
            },
          }
        );
      this.logger.debug("Login status", loginResponse);
      const { data: messageResponse } =
        await this.httpClient.get<TechnicolorBaseResponse>(
          "/api/v1/session/menu",
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              Referer: this.baseUrl,
            },
          }
        );
      this.logger.debug("Message status", messageResponse);
    } catch (error) {
      this.logger.warn(`Something went wrong with the login ${error}`);
    }
  }

  async docsis(): Promise<DocsisStatus> {
    const { data: docsisStatus } = await this.httpClient.get(
      "/api/v1/sta_docsis_status",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Referer: this.baseUrl,
        },
      }
    );
    return normalizeDocsisStatus(docsisStatus as TechnicolorDocsisStatus);
  }

  async logout(): Promise<void> {
    this.logger.debug("Logging out...");
    return this.httpClient.post("api/v1/session/logout");
  }

  async restart(): Promise<unknown> {
    const { data: tokenResponse } =
      await this.httpClient.get<TechnicolorTokenResponse>(
        "api/v1/session/init_page",
        {
          headers: {
            Referer: this.baseUrl,
          },
        }
      );

    this.logger.debug("Token response: ", tokenResponse);
    const { data: restartResponse } =
      await this.httpClient.post<TechnicolorBaseResponse>(
        "api/v1/sta_restart",
        "restart=Router%2CWifi%2CVoIP%2CDect%2CMoCA&ui_access=reboot_device",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-CSRF-TOKEN": tokenResponse.token,
            Referer: this.baseUrl,
          },
        }
      );

    if (restartResponse?.error === "error") {
      this.logger.debug(restartResponse);
      throw new Error(`Could not restart router: ${restartResponse.message}`);
    }
    return restartResponse;
  }
}

