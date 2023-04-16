import axios, { AxiosResponse } from "axios";
import { Log } from "../logger";
import { TechnicolorConfiguration } from "./technicolor-modem";
import { extractFirmwareVersion } from "./tools/html-parser";
const BRIDGED_MODEM_IP = "192.168.100.1";
const ROUTER_IP = "192.168.0.1";
axios.defaults.timeout = 10000;

interface ModemLocation {
  ipAddress: string;
  protocol: Protocol;
}

export async function discoverModemLocation(): Promise<ModemLocation> {
  try {
    const results = await Promise.allSettled([
      axios.head(`http://${BRIDGED_MODEM_IP}`),
      axios.head(`https://${BRIDGED_MODEM_IP}`),
      axios.head(`http://${ROUTER_IP}`),
      axios.head(`https://${ROUTER_IP}`),
    ]);
    const maybeResult = results.find(
      (result) => result.status === "fulfilled"
    ) as { value: AxiosResponse } | undefined;
    if (maybeResult?.value.request?.host) {
      console.warn("maybeResult");
      console.warn(maybeResult);
      return {
        ipAddress: maybeResult?.value.request?.host,
        protocol: maybeResult?.value.request?.protocol,
      };
    }
    throw new Error("Could not find a router/modem under the known addresses.");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Could not find a router/modem under the known addresses.");
    throw error;
  }
}

export type Protocol = "http" | "https";

export interface ModemInformation {
  deviceType: "Arris" | "Technicolor";
  firmwareVersion: string;
  ipAddress: string;
  protocol: Protocol;
}

export class ModemDiscovery {
  constructor(
    private readonly modemLocation: ModemLocation,
    private readonly logger: Log
  ) {}

  async tryTechnicolor(): Promise<ModemInformation> {
    const { ipAddress, protocol } = this.modemLocation;
    const { data } = await axios.get<TechnicolorConfiguration>(
      `${protocol}://${ipAddress}/api/v1/login_conf`
    );
    this.logger.debug(
      `Technicolor login configuration: ${JSON.stringify(data)}`
    );
    if (data.error === "ok" && data.data?.firmwareversion) {
      return {
        deviceType: "Technicolor",
        firmwareVersion: data.data.firmwareversion,
        ipAddress,
        protocol,
      };
    }
    throw new Error("Could not determine modem type");
  }

  async tryArris(): Promise<ModemInformation> {
    const { ipAddress, protocol } = this.modemLocation;

    const { data } = await axios.get(`${protocol}://${ipAddress}/index.php`, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml",
      },
    });
    const firmwareVersion = extractFirmwareVersion(data as string);
    if (!firmwareVersion) {
      throw new Error("Unable to parse firmware version.");
    }
    return {
      deviceType: "Arris",
      firmwareVersion,
      ipAddress,
      protocol,
    };
  }

  async discover(): Promise<ModemInformation> {
    try {
      const maybeModem = await Promise.any([
        this.tryArris(),
        this.tryTechnicolor(),
      ]);
      if (!maybeModem) {
        throw new Error("Modem discovery was unsuccessful");
      }
      return maybeModem;
    } catch (error) {
      this.logger.warn(
        "Could not find a router/modem under the known addresses"
      );
      throw error;
    }
  }
}
